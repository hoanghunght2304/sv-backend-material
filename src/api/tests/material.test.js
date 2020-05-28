/* eslint-disable no-undef */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
import { Op } from 'sequelize';
import request from 'supertest';
import httpStatus from 'http-status';
import { expect } from 'chai';
import { omit } from 'lodash';
import app from '../../index';
import Material from '../../common/models/material.model';

const token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNoYWR5bG92ZSIsInBob25lIjoiMDk4ODg4ODg4OCIsImVtYWlsIjoiZW1haWxAZ21haWwuY29tIiwibmFtZSI6Ik5ndXnhu4VuIFbEg24gVGjDoG5oIiwiYXZhdGFyIjoiL3N0b3JhZ2VzL2F2YXRhci9kZWZhdWx0LmpwZyIsImV4cCI6MTU4MzgwMjU3MiwiaWF0IjoxNTgzNzE2MTcyLCJhdWQiOiJ3ZWIiLCJpc3MiOiJhdXRoLmR1eW5ndXllbnRhaWxvci5jb20vdXNlci93ZWIifQ.XXvPX-k0ZlrneOCVLlsDthbz3aMePg2PzLO3cUV50RdiMv2Konfucb6-cYDB0r9K7tIk_fXPoq7PYNFpRmA0xVCUxs1ZSJMu5fFQHMsPf_aQRRNPpsEyfp7ws3xVOIX3ThQkk7ZBxmsUcfU_my6yAAB318qgEVYrSzeeElaRexsJgvrnJLXWALXfTaRuXaxyDO1WvgENEiYBxcOIxyYftI9yHmy3k2PNELnJaUFH-DMZ5qviZuvUjgndTbdItqhltfcdkDfuFNlyKbAdlyRbXzXk61hx4RiUHz1TNT3u51MZwAuFF0PUQ-2jKLg_cNIcqG_S3z7OMMnII5b75ZFaNw';

describe('Material API', async () => {
    let records;
    let newRecord;

    beforeEach(async () => {
        records = [
            {
                id: 'm001',
                type: 'typeA',
                description: 'Description Material A',
                name: 'Material A',
                images: [
                    '/material1.png',
                    '/material2.png',
                    '/material3.png'
                ],
                properties: {
                    unit: 'Chiếc'
                },
                attribute: ['attribute1'],
                currency: 'VND',
                origin_price: 1000,
                price: 2000,
                created_by: {
                    id: 'shadylove',
                    name: 'Shady Love'
                }
            },
            {
                id: 'm002',
                type: 'typeA',
                description: 'Description Material B',
                name: 'Material B',
                images: [
                    '/material1.png',
                    '/material2.png',
                    '/material3.png'
                ],
                properties: {
                    unit: 'Cái',
                    gender: 'Female'
                },
                attribute: ['attribute2'],
                currency: 'VND',
                origin_price: 1000,
                price: 2000,
                created_by: {
                    id: 'shadylove',
                    name: 'Shady Love'
                }
            },
            {
                id: 'm003',
                type: 'typeB',
                description: 'Description Material C',
                name: 'Material C',
                images: [
                    '/material1.png',
                    '/material2.png',
                    '/material3.png'
                ],
                properties: {
                    unit: 'Chiếc',
                    gender: 'Female'
                },
                attribute: ['attribute3'],
                currency: 'VND',
                origin_price: 4000,
                price: 5000,
                created_by: {
                    id: 'shadylove',
                    name: 'Shady Love'
                }
            }
        ];
        newRecord = {
            id: 'm004',
            type: 'typeA',
            description: 'Description Material D',
            name: 'Material D',
            images: [
                '/material1.png',
                '/material2.png',
                '/material3.png'
            ],
            properties: {
                unit: 'Cái'
            },
            attribute: ['attribute4'],
            currency: 'VND',
            origin_price: 1000,
            price: 2000,
            created_by: {
                id: 'shadylove',
                name: 'Shady Love'
            }

        };
        await Material.destroy({
            where: { id: { [Op.ne]: null } }
        });
        await Material.bulkCreate(records);
    });

    describe('GET /v1/materials/:id', () => {
        it('should get material by id', async () => {
            let model = await Material.findOne({
                id: records[0].id
            });

            model = Material.transform(model);

            return request(app)
                .get(`/v1/materials/${model.id}`)
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    console.log(res.body);

                    expect(res.body.code).to.equal(0);
                    expect(res.body.data).to.deep.include(model);
                    console.log('ok');
                });
        });
        it('should report error when id not found', () => {
            return request(app)
                .get('/v1/materials/asdasdasd')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                    console.log('ok');
                });
        });
    });

    describe('GET /v1/materials', () => {
        it('should get all materials', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(3);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all materials with skip and limit', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ skip: 2, limit: 10 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(1);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                    console.log('ok');
                });
        });
        it('should report error when skip is not a number', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ skip: 'asdasd', limit: 20 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('skip');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include('"skip" must be a number');
                    console.log('ok');
                });
        });
        it('should report error when limit is not a number', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ skip: 0, limit: 'dasdasdads' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('limit');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include('"limit" must be a number');
                    console.log('ok');
                });
        });
        it('should get all materials with keyword', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ keyword: 'm002' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(1);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                    console.log('ok');
                });
        });
        it('should return error when keyword is not a string', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ keyword: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(3);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all materials with properties', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query('properties=["Cái"]')
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(1);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                    console.log('ok');
                });
        });
        it('should return error when properties not an array', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ properties: 'asdasdas' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('properties');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include(
                        '"properties" must be an array'
                    );
                    console.log('ok');
                });
        });
        it('should get all materials with currency', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ currency: 'VND' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should return error when currency not in VND or USD', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ currency: 'asdasdas' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    console.log(res.body);
                    console.log('ok');
                });
        });
        it('should get all materials by created_at with start_time and end_time', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ by_date: 'create', start_time: '03/09/2020', end_time: '03/09/2020' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(3);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all materials by updated_at with start_time and end_time', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ by_date: 'update', start_time: '03/09/2020', end_time: '03/09/2020' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(3);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should report error when start_time parameters is not date', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ by_date: 'create', start_time: 'asdasdas', end_time: '03/06/2020' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('start_time');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include(
                        '"start_time" must be a number of milliseconds or valid date string'
                    );
                    console.log('ok');
                });
        });
        it('should report error when end_time parameters is not date', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ by_date: 'create', start_time: '03/06/2020', end_time: 'asdasdasd' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('end_time');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include(
                        '"end_time" must be a number of milliseconds or valid date string'
                    );
                    console.log('ok');
                });
        });
        it('should get all materials with min_price and max_price', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ min_price: 2000, max_price: 5000 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(3);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should report error when min_price parameters is not number', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ min_price: 'asdasdas', max_price: 5000 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('min_price');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include(
                        '"min_price" must be a number'
                    );
                    console.log('ok');
                });
        });
        it('should report error when max_price parameters is not number', () => {
            return request(app)
                .get('/v1/materials')
                .set('Authorization', token)
                .query({ min_price: 2000, max_price: 'asdasdasd' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('max_price');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include(
                        '"max_price" must be a number'
                    );
                    console.log('ok');
                });
        });
    });

    describe('POST /v1/materials', () => {
        it('should create a new material when request is ok', () => {
            return request(app)
                .post('/v1/materials')
                .set('Authorization', token)
                .send(newRecord)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when id already exists', () => {
            return request(app)
                .post('/v1/materials')
                .set('Authorization', token)
                .send(Object.assign({}, newRecord, { id: 'M001' }))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(400);
                    expect(res.body.message).to.equal('Tham số không hợp lệ.!');
                    console.log('ok');
                });
        });
        it('should create a new material when id is null', () => {
            return request(app)
                .post('/v1/materials')
                .set('Authorization', token)
                .send(omit(newRecord, 'id'))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('id');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include(
                        '"id" is required'
                    );
                    console.log('ok');
                });
        });
        it('should report error when required fields is not provided', () => {
            const requiredFields = ['type', 'name', 'properties'];
            newRecord = omit(newRecord, requiredFields);
            return request(app)
                .post('/v1/materials')
                .set('Authorization', token)
                .send(newRecord)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    for (
                        let index = 0;
                        index < requiredFields.length;
                        index += 1
                    ) {
                        const field = requiredFields[index];
                        expect(res.body.errors[index].field).to.be.equal(
                            `${field}`
                        );
                        expect(res.body.errors[index].location).to.be.equal(
                            'body'
                        );
                        expect(res.body.errors[index].messages).to.include(
                            `"${field}" is required`
                        );
                    }
                });
        });
        it('should create a new material and set default values', () => {
            const defaultValues = ['description', 'images', 'currency', 'origin_price', 'price', 'attributes'];
            newRecord = omit(
                newRecord, defaultValues
            );
            return request(app)
                .post('/v1/materials')
                .set('Authorization', token)
                .send(newRecord)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const {
                        created_by,
                        created_at,
                        updated_at
                    } = res.body.data;
                    expect(res.body.code).to.equal(0);
                    expect(created_by).to.be.an('object');
                    expect(created_at).to.be.an('number');
                    expect(updated_at).to.be.an('number');
                });
        });
    });

    describe('PUT /v1/materials/:id', () => {
        it('should update material success', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send(Object.assign({}, newRecord))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when update a material with incorrect id', () => {
            return request(app)
                .put('/v1/materials/sdsada')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                    console.log('ok');
                });
        });
        it('should update correct type material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ type: 'typeD' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect type material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ type: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('type');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"type" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct description material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ description: 'Description Material E' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect description material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ description: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('description');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"description" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct name material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ name: 'Material E' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect name material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ name: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('name');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"name" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct images material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ images: ['/material1.png'] })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect images material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ images: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('images');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"images" must be an array');
                    console.log('ok');
                });
        });
        it('should update correct properties material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({
                    properties: {
                        unit: 'Chiếc'
                    }
                })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect peoperties material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ properties: 123 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('properties');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"properties" must be an object');
                    console.log('ok');
                });
        });
        it('should update correct attributes material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ attributes: ['attribute10'] })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect attributes material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ attributes: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('attributes');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"attributes" must be an array');
                    console.log('ok');
                });
        });
        it('should update correct currency material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ currency: 'USD' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect currency material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ currency: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('currency');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"currency" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct origin_price material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ origin_price: 3000 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect origin_price material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ origin_price: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('origin_price');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"origin_price" must be a number');
                    console.log('ok');
                });
        });
        it('should update correct price material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ price: 3000 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect price material', () => {
            return request(app)
                .put('/v1/materials/m002')
                .set('Authorization', token)
                .send({ price: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('price');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"price" must be a number');
                    console.log('ok');
                });
        });
    });

    describe('DELETE /v1/materials/:id', () => {
        it('should report error when delete a material with incorrect id', () => {
            return request(app)
                .delete('/v1/materials/sdsada')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                    console.log('ok');
                });
        });
        it('should delete a material when correct id', () => {
            return request(app)
                .delete('/v1/materials/m003')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.not.equal(400);
                    expect(res.body.code).to.not.equal(404);
                    console.log('ok');
                });
        });
    });
});
