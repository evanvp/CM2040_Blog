/**
    /author pages routing 
 */

const express = require("express");
const router = express.Router();

// BlogSetting (Configuration) in seperated file 
const BlogSetting = require('../config/blogSettings')

/**
 * @desc Display all the users
 */

//the main author home route, execute a series SELECT query and render page with ejs 
router.get("/author-home", (req, res, next) => {
    // Define the query
    const queryPublished = "SELECT * FROM articles WHERE published_state = 1";
    const queryDraft = "SELECT * FROM articles WHERE published_state = 0";

    // Execute the query and render the page with the results
    global.db.all(queryPublished, function (err, published) {
        if (err) {
            return next(err); // Send the error on to the error handler
        } else {
            global.db.all(queryDraft, function (err, draft) {
                if (err) {
                    return next(err); // Send the error on to the error handler
                } else {
                    res.render("author-home.ejs", {
                        title: BlogSetting.blogTitle,
                        author: BlogSetting.authorName,
                        pub_articles: published,
                        draft_articles: draft
                    });

                }
            });
        }
    });

});

//main route for setting page, render with config data
router.get("/author-setting", (req, res, next) => {
    // No article_id provided, render the page for a new draft
    res.render("author-setting.ejs", { 
        blogTitle: BlogSetting.blogTitle,
        authorName: BlogSetting.authorName
        });
});

//for updating settings POST request
router.post("/updatesettings", (req, res, next) => {
    // No article_id provided, render the page for a new draft
    BlogSetting.blogTitle = req.body.blogTitle;
    BlogSetting.authorName = req.body.authorName;

    res.redirect("/author/author-home")
});

//main route for Edit Page
router.get("/author-edit", (req, res, next) => {
    // No article_id provided, render the page for a new draft
    res.render("author-edit.ejs", { article: null });
});

router.get("/author-edit/:id", (req, res, next) => {
    const articleId = req.params.id; 

    if (articleId) {
        // Select the existing article from the database
        const query = "SELECT * FROM articles WHERE article_id = ?";
        global.db.get(query, [articleId], (err, article) => {
            if (err) {
                return next(err);
            }
            res.render("author-edit.ejs", { article });
        });
    } else {
        // No article_id provided, render the page for a new draft
        res.render("author-edit.ejs", { article: null });
    }
});


// below is for save, publish, delete button to work
router.post("/save", (req, res, next) => {
    const currentDate = new Date().toLocaleString();

    if (req.body.article_id) {
        // Update existing article
        const queryUpdate = "UPDATE articles SET title = ?, content = ?, updated_at = ? WHERE article_id = ?";
        global.db.run(queryUpdate, [req.body.title, req.body.content, currentDate, req.body.article_id], (err) => {
            if (err) {
                return next(err);
            }
            res.redirect("/author/author-home");
        });
    } else {
        // Insert new draft
        const queryInsert = "INSERT INTO articles (title, content, created_at, updated_at, published_state) VALUES (?, ?, ?, ?, 0)";
        global.db.run(queryInsert, [req.body.title, req.body.content, currentDate, currentDate], (err) => {
            if (err) {
                return next(err);
            }
            res.redirect("/author/author-home");
        });
    }
});


router.post("/publish", (req, res, next) => {
    const currentDate = new Date().toLocaleString();

    //deal if no article_id condition (i.e. the draft is created to published without saving)
    if (req.body.article_id) {
        // Update existing article and set publish date
        const queryUpdate = "UPDATE articles SET title = ?, content = ?, updated_at = ?, published_at = ?, published_state = 1 WHERE article_id = ?";
        global.db.run(queryUpdate, [req.body.title, req.body.content, currentDate, currentDate, req.body.article_id], (err) => {
            if (err) {
                return next(err);
            }
            res.redirect("/author/author-home");
        });
    } else {
        // Insert new article and set publish date
        const queryInsert = "INSERT INTO articles (title, content, created_at, updated_at, published_at, published_state) VALUES (?, ?, ?, ?, ?, 1)";
        global.db.run(queryInsert, [req.body.title, req.body.content, currentDate, currentDate, currentDate], (err) => {
            if (err) {
                return next(err);
            }
            res.redirect("/author/author-home");
        });
    }
});


router.get("/delete/:id", (req, res, next) => {
    const articleId = req.params.id;

    // Delete comments first, so the article could be deleted
    const deleteCommentsQuery = "DELETE FROM comments WHERE article_id = ?";
    global.db.run(deleteCommentsQuery, [articleId], function(err) {
        if (err) {
            return next(err);
        }

        // If comments are successfully deleted, delete the article
        const deleteArticleQuery = "DELETE FROM articles WHERE article_id = ?";
        global.db.run(deleteArticleQuery, [articleId], function(err) {
            if (err) {
                return next(err);
            }
            
            // Redirect to author home after successful deletion
            res.redirect("/author/author-home");
        });
    });
});

// Export the router object so index.js can access it
module.exports = router;
