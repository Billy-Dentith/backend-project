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
    test('GET 404: Should return an appropriate status and error message if provided an invalid query', () => {
        return request(app)
        .get('/api/articles?topic=food')
        .expect(404)
        .then(({ body: { message }}) => {
            expect(message).toBe('Invalid Query')
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
    test('POST 404: Should return an appropriate status and error message when provided with an invalid username', () => {
        const newComment = {
            body: 'I love pugs',
            username: 'invalid_user'
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

describe('/api/comments/:comment_id', () => {
    test('DELETE 204: Should delete the comment based on provided ID', () => {
        return request(app)
        .delete('/api/comments/1')
        .expect(204)
    })
    test('DELETE 404: Should return an appropriate status and error message when provided a valid but non-existent article ID', () => {
        return request(app)
        .delete('/api/comments/9999')
        .expect(404)
        .then(({ body: { message }}) => {
            expect(message).toBe('Article Does Not Exist')
        })
    })
    test('DELETE 400: Should return an appropriate status and error message when provided an invalid article ID', () => {
        return request(app)
        .delete('/api/comments/invalid_id')
        .expect(400)
        .then(({ body: { message }}) => {
            expect(message).toBe('Bad Request')
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