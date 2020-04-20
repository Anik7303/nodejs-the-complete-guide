import React, { Component, Fragment } from 'react';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import './Feed.css';

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false
  };

  componentDidMount() {
    const graphqlQuery = {
      query: `
        query {
          user {
            status
          }
        }      
      `
    };
    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.props.token
      },
      body: JSON.stringify(graphqlQuery)
    })
    .then(res => res.json())
    .then(resData => {
      console.log(resData);
      if (resData.errors) {
        throw new Error('Failed to fetch user status.');
      }
      this.setState({ status: resData.data.user.status });
    })
    .catch(this.catchError);

    this.loadPosts();
  }

  loadPosts = direction => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }

    const graphqlQuery = {
      query: `
        query FetchPosts($page: Int) {
          posts(page: $page) {
            posts {
              _id
              title
              content
              imageUrl
              creator {
                name
              }
              createdAt
            }
            totalPosts
          }
        }
      `,
      variables: {
        page: page
      }
    }

    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.props.token
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors) {
          throw new Error('Failed to fetch posts.');
        }
        this.setState({
          posts: resData.data.posts.posts.map(post => {
            return { ...post, imagePath: post.imageUrl };
          }),
          totalPosts: resData.data.posts.totalPosts,
          postsLoading: false
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = event => {
    event.preventDefault();
    const graphqlQuery = {
      query: `
        mutation UpdateUserDetails($status: String) {
          updateUser(userInput:{status: $status}) {
            status
          }
        }
      `,
      variables: {
        status: this.state.status
      }
    };
    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer: ' + this.props.token
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => res.json())
      .then(resData => {
        if(resData.errors) {
          throw new Error('User status update failed');
        }
        console.log(resData);
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = { ...prevState.posts.find(p => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = postData => {
    this.setState({
      editLoading: true
    });

    const formData = new FormData();
    formData.append('image', postData.image);
    if(this.state.editPost) {
      formData.append('oldPath', this.state.editPost.imagePath);
    }

    fetch('http://localhost:8080/post-image', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + this.props.token
      },
      body: formData
    })
    .then(res => res.json())
    .then(fileResData => {
      let imageUrl = fileResData.filePath;
      if(imageUrl) {
        imageUrl = imageUrl.replace('\\', '/');
      }
      let graphqlQuery = {
        query: `
          mutation CreateNewPost($title: String!, $content: String!, $imageUrl: String!) {
            createPost(postInput:{title: $title, content: $content, imageUrl: $imageUrl}) {
              _id
              title
              content
              imageUrl
              creator {
                name
              }
              createdAt
            }
          }
        `,
        variables: {
          title: postData.title,
          content: postData.content,
          imageUrl: imageUrl
        }
      }

      if(this.state.editPost) {
        graphqlQuery = {
          query: `
            mutation UpdateExistingPost($id: ID!, $title: String!, $content: String!, $imageUrl: String!) {
              updatePost(postId: $id, postInput:{title: $title, content: $content, imageUrl: $imageUrl}) {
                _id
                title
                content
                imageUrl
                creator {
                  name
                }
                createdAt
              }
            }
          `,
          variables: {
            id: this.state.editPost._id,
            title: postData.title,
            content: postData.content,
            imageUrl: imageUrl || 'undefined'
          }
        }
      }

      return fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.props.token
        },
        body: JSON.stringify(graphqlQuery)
      });
    })
    .then(res => res.json())
    .then(resData => {
      if(resData.errors) {
        if(this.state.editPost) {
          throw new Error('Could not edit post');
        } else {
          throw new Error('Post creation failed');
        }
      }
      console.log(resData);
      let post;
      if(this.state.editPost) {
        post = {
          _id: resData.data.updatePost._id,
          title: resData.data.updatePost.title,
          content: resData.data.updatePost.content,
          creator: resData.data.updatePost.creator,
          createdAt: resData.data.updatePost.createdAt,
          imagePath: resData.data.updatePost.imageUrl
        };
      } else {
        post = {
          _id: resData.data.createPost._id,
          title: resData.data.createPost.title,
          content: resData.data.createPost.content,
          creator: resData.data.createPost.creator,
          createdAt: resData.data.createPost.createdAt,
          imagePath: resData.data.createPost.imageUrl
        };
      }
      this.setState(prevState => {
        let updatedPosts = [...prevState.posts];
        if (prevState.editPost) {
          const postIndex = prevState.posts.findIndex(
            p => p._id === prevState.editPost._id
          );
          updatedPosts[postIndex] = post;
        } else {
          updatedPosts.pop();
          updatedPosts.unshift(post);
        }
        return {
          posts: updatedPosts,
          isEditing: false,
          editPost: null,
          editLoading: false
        };
      });
    })
    .catch(err => {
      console.log(err);
      this.setState({
        isEditing: false,
        editPost: null,
        editLoading: false,
        error: err
      });
    });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = postId => {
    this.setState({ postsLoading: true });

    const graphqlQuery = {
      query: `
        mutation DeleteSinglePost($postId: ID!) {
          deletePost(postId: $postId)
        }
      `,
      variables: {
        postId: postId
      }
    };
    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.props.token
      },
      body: JSON.stringify(graphqlQuery)
    })
    .then(res => res.json())
    .then(resData => {
      console.log(resData);
      if (resData.errors) {
        throw new Error('Deleting a post failed!');
      }
      this.setState(prevState => {
        const updatedPosts = prevState.posts.filter(p => p._id !== postId);
        return { posts: updatedPosts, postsLoading: false };
      });
    })
    .catch(err => {
      console.log(err);
      this.setState({ postsLoading: false });
    });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: 'center' }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map(post => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString('en-US')}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
