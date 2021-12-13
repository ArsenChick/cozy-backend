import func from './func'
import "regenerator-runtime/runtime.js";

var hash = './hFErrkBMb4240.mp4';
describe('GetData', () => {
	jest.setTimeout(10000);
	test("Успешно обрабатывает видео", async() => {
		var response = await func.getData(hash);
		expect(response[0]).toBeCloseTo(30, 0);
	});
	test("Не обрабатывает не существующее видео", async() => {
		var response = await func.getData(hash+'a');
		expect(response).toEqual(undefined);
	});
});

describe('GenerateHash', () => {
	test("Успешно генерирует идентификатор", async() => {
		var response = await func.generateHash();
		expect(response).toHaveLength(10);
	});
	
});