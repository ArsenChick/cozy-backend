import request from 'supertest';
import "regenerator-runtime/runtime.js";
import fs from 'fs';
//import send from './send';
//var request = require('supertest');
//var send = require('./send');
var send = "localhost:3000";
describe('GET /', () => {
	test("Отвечает статусом 200 (успешный запрос)", async() => {
		const response = await request(send).get("/");
		expect(response.statusCode).toBe(200);
	});
	test("Получает имя", async() => {
		const response = await request(send).get("/");
		expect(response.text).toEqual(expect.stringContaining("name"));
	});
	test("Получает длину", async() => {
		const response = await request(send).get("/");
		expect(response.text).toEqual(expect.stringContaining("length"));
	});
	test("Получает адрес", async() => {
		const response = await request(send).get("/");
		expect(response.text).toEqual(expect.stringContaining("video"));
	});
});

var ret = 'bbbbbbb';

describe('GET /?video=' + ret, () => {
	test("Отвечает статусом 200 (успешный запрос)", async() => {
		const response = await request(send).get("/?video=" + ret);
		expect(response.statusCode).toBe(200);
	});
	test("Получаем кодек", async() => {
		const response = await request(send).get("/?video=" + ret);
		expect(response.text).toEqual(expect.stringContaining("libvpx") || expect.stringContaining("libx264"));
	});
	// + тест Качество + ссылка
});

describe('POST /', () => {
	const file = `${__dirname}/originals/ambulance.mp4`;
	test("Успешная загрузка", async() => {
		const r = await request(send).post("/").set('author', "testAuthor").set('title', "testVideo").attach('videofile', file);
		expect(r.text).toEqual(expect.stringContaining("video"));
		});
	});


