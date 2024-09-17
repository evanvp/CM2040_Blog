
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;


-- Define our articles table and its fields
CREATE TABLE IF NOT EXISTS articles (
    article_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published_state INTEGER NOT NULL DEFAULT 0, -- 1=published, 0=draft 
    reads_count INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, --using SQL TIMESTAMP syntax
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP DEFAULT NULL --inital time set to null (not available)
);

CREATE TABLE IF NOT EXISTS comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL, -- the article this comment is for
    author_name TEXT NOT NULL,
    comment_text TEXT NOT NULL,
    published_at DATETIME NOT NULL, -- the timestamp when the comment was published
    FOREIGN KEY (article_id) REFERENCES articles(article_id)
);

-- Insert default data (if necessary here)
INSERT INTO articles (title, content, published_state, reads_count, likes_count, created_at, updated_at, published_at)
VALUES 
('Introduction to JavaScript', 'JavaScript is a versatile programming language used primarily for web development. It allows developers to create dynamic and interactive websites.', 1, 500, 50, '2024-06-15 08:00:00', '2024-06-15 10:30:00', '2024-06-15 09:00:00'),
('Node.js Essentials', 'Node.js is a runtime environment that allows developers to run JavaScript code outside of a web browser. It is commonly used for server-side scripting and building scalable applications.', 1, 300, 30, '2024-06-20 10:00:00', '2024-06-20 12:15:00', '2024-06-20 11:00:00'),
('Getting Started with React', 'React is a JavaScript library for building user interfaces. It is maintained by Facebook and a community of individual developers and companies.', 0, 50, 5, '2024-06-25 14:30:00', '2024-06-25 15:45:00', NULL);

INSERT INTO comments (article_id, author_name, comment_text, published_at)
VALUES 
(1, 'Mary Smith', 'This article provided a clear introduction to JavaScript. I found it very informative and easy to follow.', '2023-06-15 12:00:00'),
(2, 'John Doe', 'Node.js has revolutionized how we build backend applications. Thanks for the detailed explanation!', '2023-06-20 13:00:00'),
(1, 'Alice Johnson', 'Can you also cover advanced JavaScript topics in future articles? Looking forward to more content from you!', '2023-06-15 14:00:00');

COMMIT;







