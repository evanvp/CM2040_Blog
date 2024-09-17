// routes: /reader
const express = require('express');
const router = express.Router();
const BlogSetting = require('../config/blogSettings');

//main route for reader-home page
router.get("/reader-home", (req, res, next) => {
    //EXTENSION FUNCTION, default as 'published_at'
    let sortBy = req.query.sortBy || 'published_at'; 

    // Define the query
    const queryPublished = `SELECT * FROM articles WHERE published_state = 1 ORDER BY ${sortBy} DESC`;

    // Execute the query and render the page with the results
    global.db.all(queryPublished, function (err, published) {
        if (err) {
            return next(err); // Send the error on to the error handler
        } else {
                res.render("reader-home.ejs", {
                        title: BlogSetting.blogTitle,
                        author: BlogSetting.authorName,
                        pub_articles: published,
                        sortBy: sortBy
                    });

                }
    })  

});


// Route to get article and its comments, and render the article page
router.get('/reader-article/:id', (req, res, next) => {
    const articleId = req.params.id;

    // SQL query to fetch article by ID
    const articleQuery = `SELECT * FROM articles WHERE article_id = ?`;
    global.db.get(articleQuery, [articleId], (err, article) => {
        if (err) {
            return next(err);
        }
        //deal when a aritcle is not published or null 
        if (!article || article.published_state === 0) {
            return res.status(404).send('Article not found');
        }

        //the published article exists, read count +1 and render
        const incrementReadsQuery = `UPDATE articles SET reads_count = reads_count + 1 WHERE article_id = ?`;
        global.db.run(incrementReadsQuery, [articleId], (err) => {
            if (err) {
                return next(err);
            }

            // SQL query to retreive comments for the article
            const commentsQuery = `SELECT * FROM comments WHERE article_id = ? ORDER BY published_at DESC`;
            global.db.all(commentsQuery, [articleId], (err, comments) => {
                if (err) {
                    return next(err);
                }

                // Render the EJS template with article and comments data
                res.render('reader-article.ejs', { article, comments });
            });
        });
    });
});

// Route to handle comment submission
router.post('/comment', (req, res) => {
   
    // SQL query to insert a comment
    const query = `INSERT INTO comments (article_id, author_name, comment_text, published_at)
        VALUES (?, ?, ?, ?)`;

    const params = [req.body.article_id, req.body.author_name, req.body.comment, new Date().toLocaleString()]

    global.db.run(query, params, function(err) {
        if (err) {
            return next(err);
        }
        res.redirect(`/reader/reader-article/${req.body.article_id}`);
    });
});

//route to handle like
router.get("/like/:id", (req, res, next) => {
    const articleId = req.params.id;

    // Update likes_count in the database
    // Also reads_count -1 because redirect cause +1 in reads_count
    const query = "UPDATE articles SET likes_count = likes_count + 1, reads_count = reads_count -1 WHERE article_id = ?";
    global.db.run(query, [articleId], (err) => {
        if (err) {
            return next(err);
        }
        res.redirect(`/reader/reader-article/${req.params.id}`);
    });
});


module.exports = router;