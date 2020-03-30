module.exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{ title: 'First Post', content: 'This is the first post!' }]
    });
};

module.exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
    // create post in db
    res.status(201).json({ // status code 201 => sucess and created a resource
        message: 'Post created successfully',
        post: {
            id: new Date().toISOString(),
            title: title,
            content: content
        }
    });
};
