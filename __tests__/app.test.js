const app = require('../app')
const db = require('../db/connection');
const seed = require('../db/seeds/seed')
const testData = require('../db/data/test-data');
const request = require('supertest');
const availableEndpoints = require('../endpoints.json');

afterAll(() => db.end());
beforeEach(() => seed(testData));

describe('/api/healthcheck', () => {
    test('GET 200: Should respond with a 200 ok status code', () => {
        return request(app)
        .get('/api/healthcheck')
        .expect(200)
        .then(({ body : { message }}) => {
            expect(message).toBe('All OK')
        })
    })
})

describe('Invalid Endpoints', () => {
    test('Shold return a 404 error code when passed an invalid endpoint', () => {
        return request(app)
        .get('/api/topicss')
        .expect(404)
        .then(({ body: { message } }) => {
            expect(message).toBe('Endpoint Not Found');
        })
    })
})

describe('/api', () => {
    test('GET 200: Should return a description of all available endpoints', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
            expect(body).toEqual(availableEndpoints)
        })
    })
})

describe('/api/topics', () => {
    test('GET 200: Should return an array of all the topics', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body: { topics } }) => {
            expect(topics.length).toBe(3);
            topics.forEach((topic) => {
                expect(typeof topic.description).toBe('string');
                expect(typeof topic.slug).toBe('string');
            })
        })
    })
    test('POST 201: Should return the posted topic', () => {
        const newTopic = {
            slug: "new topic",
            description: "new topic description"
        }
        return request(app)
        .post('/api/topics')
        .send(newTopic)
        .expect(201)
        .then(({ body: { topic }}) => {
            expect(topic.slug).toBe("new topic")
            expect(topic.description).toBe("new topic description")

        })
    })
    test('POST 400: Should return an appropriate status and error message when provided a bad topic (no slug/description)', () => {
        const newTopic = {
            description: "new topic description"
        }
        return request(app)
        .post('/api/topics')
        .send(newTopic)
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe("Bad Request")
        })
    })
    test('POST 400: Should return an appropriate status and error message when provided with extra unwanted properties in the new topic object', () => {
        const newTopic = {
            slug: "new topic",
            description: "new topic description",
            maliciousProperty: "delete everything"
        }
        return request(app)
        .post('/api/topics')
        .send(newTopic)
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe("Invalid Topic")
        })
    })
})

describe('/api/articles/:article_id', () => {
    test('GET 200: Should return with a single article of the provided id', () => {
        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({ body: { article }}) => {
            expect(article.article_id).toBe(1)
            expect(article.title).toBe('Living in the shadow of a great man');
            expect(article.topic).toBe('mitch')
            expect(article.author).toBe('butter_bridge');
            expect(article.body).toBe('I find this existence challenging');
            expect(typeof article.created_at).toBe('string')
            expect(article.votes).toBe(100);
            expect(article.article_img_url).toBe('https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700');
        })
    })
    test('GET 404: Should return an appropriate status and error message if given a valid but non-existent id', () => {
        return request(app)
        .get('/api/articles/9999')
        .expect(404)
        .then(({ body : { message }}) => {
            expect(message).toBe('Article does not exist')
        })
    })
    test('GET 400: Should return an appropriate status and error message if given an invalid id', () => {
        return request(app)
        .get('/api/articles/invalid_id')
        .expect(400)
        .then(({ body : { message }}) => {
            expect(message).toBe('Bad Request')
        })
    })
    test('GET 200: Should return the article with a comment_count property added on', () => {
        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({ body: { article }}) => {
            expect(article).toHaveProperty('comment_count')
        })
    })
    test('GET 200: Should return the article with a comment_count of 0 if provided an article with no comments', () => {
        return request(app)
        .get('/api/articles/2')
        .expect(200)
        .then(({ body: { article }}) => {
            expect(article).toHaveProperty('comment_count')
            expect(article.comment_count).toBe(0)
        })
    })
})

describe('/api/articles', () => {
    test('GET 200: Should return an array of all the articles', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body: { articles }}) => {
            expect(articles.length).toBe(13)
            articles.forEach((article) => {
                expect(article).toMatchObject({
                    article_id: expect.any(Number),
                    title: expect.any(String),
                    topic: expect.any(String),
                    author: expect.any(String),
                    created_at: expect.any(String),
                    article_img_url: expect.any(String),
                    votes: expect.any(Number),
                    comment_count: expect.any(Number)
                })
            })
        })
    })
    test('GET 200: Should return the array sorted by date in descending order', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body: { articles }}) => {
            expect(articles).toBeSortedBy('created_at', { 
                descending: true
            })
        })
    })
    test('GET 200: Should return an array of all the articles paginated according to limit and page queries', () => {
        return request(app)
        .get('/api/articles?limit=5&page=3')
        .expect(200)
        .then(({ body: { articles }}) => {
            expect(articles.length).toBe(3);
            expect(articles[0].article_id).toBe(8);
            expect(articles[1].article_id).toBe(11);
            expect(articles[2].article_id).toBe(7);
        })
    })
    test('GET 200: Should return an array of all the articles paginated according page query and with limit defaulting to 10', () => {
        return request(app)
        .get('/api/articles?page=2')
        .expect(200)
        .then(({ body: { articles }}) => {
            expect(articles.length).toBe(3);
            expect(articles[0].article_id).toBe(8);
            expect(articles[1].article_id).toBe(11);
            expect(articles[2].article_id).toBe(7);
        })
    })
    test('GET 200: Should return an object with an array of all the articles paginated according to limit and page queries and a total_count key showing the total number of articles', () => {
        return request(app)
        .get('/api/articles?topic=mitch&limit=5&page=3')
        .expect(200)
        .then(({ body }) => {
            expect(body.articles.length).toBe(2);
            expect(body.total_count).toBe(12)
        })
    })
    test('GET 400: Should return an appropriate status and error message if provided an invalid limit query', () => {
        return request(app)
        .get('/api/articles?limit=not_a_limit')
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Bad Request')
        })
    })
    test('GET 200: Should return an array of articles that meet the provided query of topic', () => {
        return request(app)
        .get('/api/articles?topic=cats')
        .expect(200)
        .then(({ body: { articles }}) => {
            expect(articles.length).toBe(1);
            articles.forEach((article) => {
                expect(article.topic).toBe('cats')
            })
        })
    })
    test('GET 200: Should return an empty array if provided a valid topic query that has no articles', () => {
        return request(app)
        .get('/api/articles?topic=paper')
        .expect(200)
        .then(({ body: { articles }}) => {
            expect(articles.length).toBe(0);
        })
    })
    test('GET 400: Should return an appropriate status and error message if provided an invalid query', () => {
        return request(app)
        .get('/api/articles?topic=food')
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Invalid Query')
        })
    })
    test('GET 200: Should return the array sorted by the provided query in the provided order', () => {
        return request(app)
        .get('/api/articles?sort_by=votes&order=asc')
        .expect(200)
        .then(({ body: { articles }}) => {
            expect(articles).toBeSortedBy('votes', { 
                ascending: true
            })
        })
    })
    test('GET 400: Should return an appropriate status and error message if provided an invalid sort_by', () => {
        return request(app)
        .get('/api/articles?sort_by=invalid_sort')
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Invalid Query')
        })
    })
    test('GET 400: Should return an appropriate status and error message if provided an invalid order', () => {
        return request(app)
        .get('/api/articles?order=invalid_order')
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Invalid Query')
        })
    })
})

describe('/api/articles', () => {
    test('POST 201: Should return the posted article', () => {
        const newArticle = {
            author: 'icellusedkars',
            title: '5 things you can do with paper',
            body: 'origami, paper planes, take notes, throw at someone, burn',
            topic: 'paper'
        }
        return request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(201)
        .then(({ body: { article }}) => {
            expect(article).toMatchObject({
                article_id: 14,
                title: '5 things you can do with paper',
                topic: 'paper',
                author: 'icellusedkars',
                body: 'origami, paper planes, take notes, throw at someone, burn',
                created_at: expect.any(String),
                votes: 0,
                article_img_url: 'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700',
                comment_count: 0
            })
        })
    })
    test('POST 400: Should return an appropriate status and error message if provided a bad article (missing properties)', () => {
        const newArticle = {
            author: 'icellusedkars',
        }
        return request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Bad Request')
        })
    })
    test('POST 400: Should return an appropriate status and error message when provided extra unwanted properties in the new article object', () => {
        const newArticle = {
            author: 'icellusedkars',
            title: '5 things you can do with paper',
            body: 'origami, paper planes, take notes, throw at someone, burn',
            topic: 'paper',
            maliciousProperty: 'delete everything'
        }
        return request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Invalid Article')
        })
    })
})

describe('/api/articles/:article_id/comments', () => {
    test('GET 200: Should return all the comments for a given article', () => {
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body: { comments }}) => {
            expect(comments.length).toBe(11)
            comments.forEach((comment) => {
                expect(comment).toMatchObject({
                    comment_id: expect.any(Number),
                    votes: expect.any(Number),
                    created_at: expect.any(String),
                    author: expect.any(String),
                    body: expect.any(String),
                    article_id: expect.any(Number),
                })
            })
        })       
    })
    test('GET 200: Should return the array with most recent comments first', () => {
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body: { comments }}) => {
            expect(comments).toBeSortedBy('created_at', {
                descending: true
            })
        })
    })
    test('GET 200: Should return an empty array when provided an article_id that exists but has no comments', () => {
        return request(app)
        .get('/api/articles/2/comments')
        .expect(200)
        .then(({ body: { comments }}) => {
            expect(comments.length).toBe(0)
        })
    })
    test('GET 404: Should return an appropriate status and error message when provided a valid but non existent id', () => {
        return request(app)
        .get('/api/articles/9999/comments')
        .expect(404)
        .then(({ body: { message }}) => {
            expect(message).toBe('Article Does Not Exist')
        })
    })
    test('GET 400: Should return an appropriate status and error message when provided an invalid id', () => {
        return request(app)
        .get('/api/articles/invalid_id/comments')
        .then(({ body: { message }}) => {
            expect(message).toBe('Bad Request')
        })
    })
    test('GET 200: Should return an array of all the comments paginated according to limit and page queries', () => {
        return request(app)
        .get('/api/articles/1/comments?limit=5&page=3')
        .expect(200)
        .then(({ body: { comments }}) => {
            expect(comments.length).toBe(1);
            expect(comments[0].comment_id).toBe(9);
        })
    })
    test('GET 200: Should return an array of all the comments paginated according page query and with limit defaulting to 10', () => {
        return request(app)
        .get('/api/articles/1/comments?page=2')
        .expect(200)
        .then(({ body: { comments }}) => {
            expect(comments.length).toBe(1);
            expect(comments[0].comment_id).toBe(9);
        })
    })
    test('GET 400: Should return an appropriate status and error message if provided an invalid limit query', () => {
        return request(app)
        .get('/api/articles/1/comments?limit=not_a_limit')
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Bad Request')
        })
    })
})

describe('/api/articles/:article_id/comments', () => {
    test('POST 201: Should return the posted comment', () => {
        const newComment = {
            body: 'I love pugs',
            username: 'lurker'
        };
        return request(app)
        .post('/api/articles/3/comments')
        .send(newComment)
        .expect(201)
        .then(({ body: { comment }})=> {
            expect(comment.author).toBe("lurker")
            expect(comment.body).toBe("I love pugs")
            expect(comment.votes).toBe(0)
            expect(comment.article_id).toBe(3)
        })
    })
    test('POST 400: Should return an appropriate status and error message when provided with a bad comment (no comment body)', () => {
        const newComment = {
            username: 'lurker'
        }
        return request(app)
        .post('/api/articles/3/comments')
        .send(newComment)
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Bad Request')
        })
    })
    test('POST 400: Should return an appropriate status and error message when provided with extra unwanted properties in the new comment object', () => {
        const newComment = {
            body: 'I love pugs',
            username: 'invalid_user',
            maliciousProperty: "delete everything"
            
        }
        return request(app)
        .post('/api/articles/3/comments')
        .send(newComment)
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Invalid Comment')
        })
    })
    test('POST 404: Should return an appropriate status and error message when provided with a non-existent user', () => {
        const newComment = {
            body: 'I love pugs',
            username: 'non_existent_user'
        }
        return request(app)
        .post('/api/articles/3/comments')
        .send(newComment)
        .expect(404)
        .then(({ body: { message }}) => {
            expect(message).toBe('User Does Not Exist')
        })
    })
})

describe('/api/articles/:article_id', () => {
    test('PATCH 202: Should update an article by ID and return the updated article (postive vote incrementations)', () => {
        const updArticle = {
            inc_votes: 10
        }
        return request(app)
        .patch('/api/articles/1')
        .send(updArticle)
        .expect(202)
        .then(({ body: { article }}) => {
            expect(article.article_id).toBe(1)
            expect(article.title).toBe("Living in the shadow of a great man")
            expect(article.votes).toBe(110)
        })
    })
    test('PATCH 202: Should update an article by ID and return the updated article (negative vote incrementations)', () => {
        const updArticle = {
            inc_votes: -10
        }
        return request(app)
        .patch('/api/articles/1')
        .send(updArticle)
        .expect(202)
        .then(({ body: { article }}) => {
            expect(article.article_id).toBe(1)
            expect(article.title).toBe("Living in the shadow of a great man")
            expect(article.votes).toBe(90)
        })
    })
    test('PATCH 400: Should return an appropriate status and error message when provided with a bad body (missing required field / incorrect field)', () => {
        const updArticle = {
            inc_votes: 'ten'
        }
        return request(app)
        .patch('/api/articles/1')
        .send(updArticle)
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Bad Request')
        })
    })
    test('PATCH 400: Should return an appropriate status and error message when provided an invalid article ID', () => {
        const updArticle = {
            inc_votes: 10
        }
        return request(app)
        .patch('/api/articles/invalid_id')
        .send(updArticle)
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Bad Request')
        })
    })
    test('PATCH 404: Should return an appropriate status and error message when provided a valid but non-existent article ID', () => {
        const updArticle = {
            inc_votes: 10
        }
        return request(app)
        .patch('/api/articles/9999')
        .send(updArticle)
        .expect(404)
        .then(({ body: { message }}) => {
            expect(message).toBe('Article Does Not Exist')
        })
    })
})

describe('/api/articles/:article_id', () => {
    test('DELETE 204: Should delete the article and its corresponding comments based on provided article ID', () => {
        return request(app)
        .delete('/api/articles/1')
        .expect(204)
        .then(() => {
            return request(app)
            .get('/api/articles/1')
            .expect(404)
        })
        .then(() => {
            return db.query(`SELECT * FROM comments`).then(({ rows }) => {
                expect(rows.length).toBe(7);
            })
        })
    })
    test('DELETE 404: Should return an appropriate status and error message when provided a valid but non-existent article ID', () => {
        return request(app)
        .delete('/api/articles/9999')
        .expect(404)
        .then(({ body: { message }}) => {
            expect(message).toBe('Article Does Not Exist')
        })
    })
    test('DELETE 404: Should return an appropriate status and error message when provided an invalid article ID', () => {
        return request(app)
        .delete('/api/articles/invalid-id')
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Bad Request')
        })
    })
})

describe('/api/comments/:comment_id', () => {
    test('DELETE 204: Should delete the comment based on provided ID', () => {
        return request(app)
        .delete('/api/comments/1')
        .expect(204)
        .then(() => {
            return db.query(`SELECT * FROM comments`).then(({ rows }) => {
                expect(rows.length).toBe(17);
            })
        })
    })
    test('DELETE 404: Should return an appropriate status and error message when provided a valid but non-existent comment ID', () => {
        return request(app)
        .delete('/api/comments/9999')
        .expect(404)
        .then(({ body: { message }}) => {
            expect(message).toBe('Comment Does Not Exist')
        })
    })
    test('DELETE 400: Should return an appropriate status and error message when provided an invalid comment ID', () => {
        return request(app)
        .delete('/api/comments/invalid_id')
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Bad Request')
        })
    })
    test('PATCH 202: Should update a comment by ID and return the updated comment object', () => {
        const updComment = {
            inc_votes: 10
        }
        return request(app)
        .patch('/api/comments/1')
        .send(updComment)
        .expect(202)
        .then(({ body: { comment }}) => {
            expect(comment.comment_id).toBe(1)
            expect(comment.votes).toBe(26)
        })
    })
    test('PATCH 202: Should update a comment by ID and return the updated comment object (negative vote incrementations)', () => {
        const updComment = {
            inc_votes: -10
        }
        return request(app)
        .patch('/api/comments/1')
        .send(updComment)
        .expect(202)
        .then(({ body: { comment }}) => {
            expect(comment.comment_id).toBe(1)
            expect(comment.votes).toBe(6)
        })
    })
    test('PATCH 400: Should return an appropriate status and error message when provided a bad body (missing required field / incorrect field)', () => {
        const updComment = {
            inc_votes: 'ten'
        }
        return request(app)
        .patch('/api/comments/1')
        .send(updComment)
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Bad Request')
        })
    })
    test('PATCH 400: Should return an appropriate status and error message when provided an invalid comment ID', () => {
        const updComment = {
            inc_votes: 10
        }
        return request(app)
        .patch('/api/comments/invalid_id')
        .send(updComment)
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Bad Request')
        })
    })
    test('PATCH 404: Should return an appropriate status and error message when provided a valid but non-existent comment ID', () => {
        const updComment = {
            inc_votes: 10
        }
        return request(app)
        .patch('/api/comments/9999')
        .send(updComment)
        .expect(404)
        .then(({ body: { message }}) => {
            expect(message).toBe('Comment Does Not Exist')
        })
    })
})

describe('/api/users', () => {
    test('GET 200: Should return an array of users', () => {
        return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body: { users }}) => {
            expect(users.length).toBe(4)
            users.forEach((user) => {
                expect(user).toMatchObject({
                    username: expect.any(String),
                    name: expect.any(String),
                    avatar_url: expect.any(String) 
                })
            })
        })
    })
})

describe('/api/users/:username', () => {
    test('GET 200: Should return a user object from provided username', () => {
        return request(app)
        .get('/api/users/butter_bridge')
        .expect(200)
        .then(({ body: { user }}) => {
            expect(user.username).toBe('butter_bridge');
            expect(user.name).toBe('jonny');
            expect(user.avatar_url).toBe('https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg');
        })
    })
    test('GET 404: Should return an appropriate status and error message when provided a non-existent user', () => {
        return request(app)
        .get('/api/users/non_existent_user')
        .expect(404)
        .then(({ body: { message }}) => {
            expect(message).toBe('User Not Found')
        })
    })
})