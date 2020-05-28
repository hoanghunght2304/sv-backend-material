/* eslint-disable no-undef */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
import { Op } from 'sequelize';
import request from 'supertest';
import httpStatus from 'http-status';
import { expect } from 'chai';
import { omit } from 'lodash';
import app from '../../index';
import Atrribute from '../../common/models/attribute.model';

const token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA4ODg4ODg4IiwicGhvbmUiOiIwODg4ODg4ODg4IiwiZW1haWwiOiJ2dXF1YW5nbmFtQGdtYWlsLmNvbSIsIm5hbWUiOiJOYW1WUSIsImF2YXRhciI6Ii9zdG9yYWdlcy9hdmF0YXIvZGVmYXVsdC5qcGciLCJleHAiOjE1ODM4MDQ1NTIsImlhdCI6MTU4MzcxODE1MiwiYXVkIjoid2ViIiwiaXNzIjoiYXV0aC5kdXluZ3V5ZW50YWlsb3IuY29tL3VzZXIvd2ViIn0.aqMfzQUQBsgDWsB-TLbYYzt7ZHYsmy0x2eYRAiemGMiorzF-KCDsv5PbKfNRsMUD210gicjRjdmWRJ8xk0xtdc1tXWcQBGA0YnXHPae1gQdEfGZwdyX-YrdREmMbRiJ9-8FrvgIOYQ0HsojJMg48RACltgdoTCSa3Wh1JLcYM6t1Gdy0alhDDG5IKix5fx4AOw1e-m4XvGtpqMKweti9oV5RUmWcUTknwkGcXKhzDLZi92XfyG7PdxVPJM8rDVLwcCFGH51ayhTI0Wz-RJiZk-R3RJ4b679TQkABZbmOY6Qetktz5HQrZgoxV6D8fUhrSjIS9EC0XyhA3IJC5Hp5Ag';

describe('material-attributess API', async () => {
    let dbAtrribute;

    const dbInsert = {
        id: 'attribute1',
        name: 'Attribute5',
        description: 'Attribute5',
        categories: [
            {
                id: 'cat1',
                name: 'cat1',
                price: 123
            }
        ]
    };

    beforeEach(async () => {
        dbAtrribute = [
            {
                id: 'attribute111',
                name: 'Attribute111',
                description: 'Attribute111',
                categories: [
                    {
                        id: 'cat1',
                        name: 'cat1',
                        price: 123
                    }
                ]
            },
            {
                id: 'attribute222',
                name: 'Attribute222',
                description: 'Attribute222',
                categories: [
                    {
                        id: 'cat1',
                        name: 'cat1',
                        price: 123
                    },
                    {
                        id: 'cat2',
                        name: 'cat2',
                        price: 123
                    }
                ]
            },
            {
                id: 'attribute333',
                name: 'Attribute333',
                description: 'Attribute33',
                categories: [
                    {
                        id: 'cat3',
                        name: 'cat3',
                        price: 123
                    },
                    {
                        id: 'cat3',
                        name: 'cat3',
                        price: 123
                    }
                ]
            },
        ];

        await Atrribute.destroy({
            where: {
                id: { [Op.ne]: null }
            }
        });

        await Atrribute.bulkCreate(dbAtrribute);
    });

    describe('GET /v1/material-attributes', () => {
        it('should get all material attribute', () => {
            return request(app)
                .get('/v1/material-attributes')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.eq(3);
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                });
        });

        it('should get material-attributes with param skip 2, limit 10', () => {
            return request(app)
                .get('/v1/material-attributes')
                .set('Authorization', token)
                .query({ skip: 2, limit: 10 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                });
        });

        it('should return error param skip not a number', () => {
            return request(app)
                .get('/v1/material-attributes')
                .set('Authorization', token)
                .query({ skip: 'haha', limit: 20 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.equal(400);
                    expect(field).to.be.equal('skip');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include('"skip" must be a number');
                });
        });

        it('should return error param limit not a number', () => {
            return request(app)
                .get('/v1/material-attributes')
                .set('Authorization', token)
                .query({ skip: 0, limit: 'haha' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('limit');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include('"limit" must be a number');
                });
        });

        it('should get all material-attributes with param keyword e11', () => {
            return request(app)
                .get('/v1/material-attributes')
                .set('Authorization', token)
                .query({ keyword: 'e11' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.eq(1);
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                });
        });

        it('should get all material-attributes with param by_date: create, start_time, end_time', () => {
            return request(app)
                .get('/v1/material-attributes')
                .set('Authorization', token)
                .query({ by_date: 'create', start_time: '02/24/2020', end_time: '02/25/2020' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.equal(0);
                    expect(res.body.code).to.be.equal(0);
                    expect(res.body.data).to.have.lengthOf(0);
                });
        });

        it('should get return error with param start_time not a date', () => {
            return request(app)
                .get('/v1/material-attributes')
                .set('Authorization', token)
                .query({ start_time: 'haha' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(field).to.be.equal('start_time');
                    expect(location).to.be.equal('query');
                    expect(res.body.code).to.equal(400);
                    expect(messages).to.include(
                        '"start_time" must be a number of milliseconds or valid date string'
                    );
                });
        });

        it('should get return error with param end_time not a date', () => {
            return request(app)
                .get('/v1/material-attributes')
                .set('Authorization', token)
                .query({ end_time: 'haha' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(field).to.be.equal('end_time');
                    expect(location).to.be.equal('query');
                    expect(res.body.code).to.equal(400);
                    expect(messages).to.include(
                        '"end_time" must be a number of milliseconds or valid date string'
                    );
                });
        });
    });

    describe('GET /v1/material-attributes/:id', () => {
        it('should return error with id incorrect', () => {
            return request(app)
                .get('/v1/material-attributes/9')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                });
        });

        it('should get material attribute by id', async () => {
            let model = await Atrribute.findOne({
                id: dbAtrribute[0].id
            });

            model = Atrribute.transform(model);

            return request(app)
                .get(`/v1/material-attributes/${model.id}`)
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data.id).to.equal(model.id);
                    expect(res.body.code).to.equal(0);
                });
        });
    });

    describe('POST /v1/material-attributes', () => {
        it('should material attributes be created when request is ok', () => {
            return request(app)
                .post('/v1/material-attributes')
                .set('Authorization', token)
                .send(dbInsert)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    expect(res.body.message).to.equal('Thêm mới thành công.!');
                });
        });

        it('should report error when add material attributes not id', () => {
            return request(app)
                .post('/v1/material-attributes')
                .set('Authorization', token)
                .send(omit(dbInsert, 'id'))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(field).to.be.equal('id');
                    expect(location).to.be.equal('body');
                    expect(res.body.code).to.equal(400);
                    expect(messages).to.include('"id" is required');
                });
        });

        it('should report an error when the same id', () => {
            return request(app)
                .post('/v1/material-attributes')
                .set('Authorization', token)
                .send({
                    id: 'attribute111',
                    name: 'Attribute111',
                    description: 'Attribute111',
                    categories: [
                        {
                            id: 'cat1',
                            name: 'cat1',
                            price: 123
                        }
                    ]
                })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { type, message, validatorKey } = res.body.errors[0];
                    expect(type).to.be.equal('unique violation');
                    expect(res.body.code).to.equal(500);
                    expect(message).to.equal('id must be unique');
                    expect(validatorKey).to.equal('not_unique');
                });
        });

        it('should report error when add material attributes not name', () => {
            return request(app)
                .post('/v1/material-attributes')
                .set('Authorization', token)
                .send(omit(dbInsert, 'name'))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(field).to.be.equal('name');
                    expect(location).to.be.equal('body');
                    expect(res.body.code).to.equal(400);
                    expect(messages).to.include('"name" is required');
                });
        });

        it('should report errors when categories do not exist', () => {
            return request(app)
                .post('/v1/material-attributes')
                .set('Authorization', token)
                .send(omit(dbInsert, 'categories'))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('categories');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"categories" is required');
                });
        });

        it('should error should be reported when the catalog is not an array', () => {
            return request(app)
                .post('/v1/material-attributes')
                .set('Authorization', token)
                .send({
                    id: 'Attribute1',
                    name: 'Attribute5',
                    description: 'Attribute5',
                    categories: {}
                })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('categories');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"categories" must be an array');
                });
        });
    });

    describe('PUT /v1/material-attributes/:id', () => {
        it('should report error when the id is incorrect', () => {
            return request(app)
                .put('/v1/material-attributes/9')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                });
        });

        it('should material attribute be updated with the correct name', () => {
            return request(app)
                .put('/v1/material-attributes/attribute111')
                .set('Authorization', token)
                .send(Object.assign({}, dbAtrribute, { name: 'material attribute' }))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    expect(res.body.message).to.equal('Cập nhật dữ liệu thành công.!');
                });
        });

        it('should report error when name required field is not provided', () => {
            return request(app)
                .put('/v1/material-attributes/attribute111')
                .set('Authorization', token)
                .send(Object.assign({}, dbAtrribute, { name: '' }))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(400);
                    expect(res.body.errors[0].messages[0]).to.equal('"name" is not allowed to be empty');
                });
        });

        it('should material attribute be updated with the correct description', () => {
            return request(app)
                .put('/v1/material-attributes/attribute111')
                .set('Authorization', token)
                .send(Object.assign({}, dbAtrribute, { description: '12313123' }))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    expect(res.body.message).to.equal('Cập nhật dữ liệu thành công.!');
                });
        });

        it('should report error when description required field is not provided', () => {
            return request(app)
                .put('/v1/material-attributes/attribute111')
                .set('Authorization', token)
                .send(Object.assign({}, dbAtrribute, { description: '' }))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(400);
                    expect(res.body.errors[0].messages[0]).to.equal('"description" is not allowed to be empty');
                });
        });

        it('should material attribute be updated with the correct categories', () => {
            return request(app)
                .put('/v1/material-attributes/attribute111')
                .set('Authorization', token)
                .send(Object.assign({}, dbAtrribute, {
                    categories: [
                        {
                            id: '2',
                            name: '2',
                            price: 123
                        }
                    ]
                }))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    expect(res.body.message).to.equal('Cập nhật dữ liệu thành công.!');
                });
        });
    });

    describe('DELETE /v1/material-attributes/:id', () => {
        it('should report error when id incorrect', () => {
            return request(app)
                .delete('/v1/material-attributes/ad134246')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                });
        });

        it('should material attribute be deletion with the correct id', () => {
            return request(app)
                .delete('/v1/material-attributes/attribute111')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    expect(res.body.message).to.equal('Xóa dữ liệu thành công.!');
                });
        });
    });
});
