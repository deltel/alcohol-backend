import {
    isAlphaNumeric,
    isEmpty,
    isNonNegative,
    isNumeric,
    isPositive,
    lettersOnly,
    strongPassword,
    validDate,
    validEmail,
    validLength,
    validCustomerName,
    validOrderType,
    validTelephone,
} from '../../src/validation/validators';

describe('validators', () => {
    describe('email', () => {
        test('is valid', () => {
            const isValid = validEmail('anon@anon.com');
            expect(isValid).toBe(true);
        });

        test('is invalid', () => {
            const isValid = validEmail('jka@kay');
            expect(isValid).toBe(false);
        });
    });

    describe('telephone', () => {
        test('only contains numbers, has length of 10', () => {
            const _validTelephone = validTelephone('8761234567');

            expect(_validTelephone).toBe(true);
        });

        test('invalid telephone', () => {
            const _validTelephone = validTelephone('87634567');
            const _validTelephone1 = validTelephone('87634567ab');
            const _validTelephone2 = validTelephone('876-123-4567');

            expect(_validTelephone).toBe(false);
            expect(_validTelephone1).toBe(false);
            expect(_validTelephone2).toBe(false);
        });
    });

    describe('password', () => {
        test('has at least 8 characters, 1 lowercase, 1 uppercase, 1 symbol', () => {
            const _strongPassword = strongPassword('ancsdkmeeo1W*');

            expect(_strongPassword).toBe(true);
        });

        test('is weak', () => {
            const _strongPassword = strongPassword('abcd*');

            expect(_strongPassword).toBe(false);
        });
    });

    describe('name', () => {
        test('is not empty, has at least 1 character, maximum 20 characters, contains only letters', () => {
            const _validName = validCustomerName('maple');
            const _validName1 = validCustomerName('m');
            const _validName2 = validCustomerName('abcdefghijklmnopqrst');

            expect(_validName).toBe(true);
            expect(_validName1).toBe(true);
            expect(_validName2).toBe(true);
        });

        test('is invalid', () => {
            const _validName = validCustomerName('');
            const _validName1 = validCustomerName('m1');
            const _validName2 = validCustomerName(' ');

            expect(_validName).toBe(false);
            expect(_validName1).toBe(false);
            expect(_validName2).toBe(false);
        });
    });

    describe('String', () => {
        test('is empty', () => {
            const emptyString = isEmpty('');
            const whiteSpace = isEmpty(' ');

            expect(emptyString).toBe(true);
            expect(whiteSpace).toBe(true);
        });

        test('is not empty', () => {
            const empty = isEmpty('anon');

            expect(empty).toBe(false);
        });

        test('has exactly 1 character', () => {
            const validString = validLength('1', { min: 1, max: 1 });

            expect(validString).toBe(true);
        });

        test('has at least 8 characters', () => {
            const validString = validLength('monsterimpossible');
            const _validString = validLength('monsteri');

            expect(validString).toBe(true);
            expect(_validString).toBe(true);
        });

        test('has less than 8 characters', () => {
            const validString = validLength('abcd');
            const _validString = validLength('abcdefg');

            expect(validString).toBe(false);
            expect(_validString).toBe(false);
        });

        test('only contains numbers', () => {
            const validNumber = isNumeric('1234567');

            expect(validNumber).toBe(true);
        });

        test('does not contain only numbers', () => {
            const validNumber = isNumeric('1234567-a');

            expect(validNumber).toBe(false);
        });

        test('contains only letters', () => {
            const validLetters = lettersOnly('ab');
            const _validLetters = lettersOnly('Ab');
            const _validLetters1 = lettersOnly('AB');

            expect(validLetters).toBe(true);
            expect(_validLetters).toBe(true);
            expect(_validLetters1).toBe(true);
        });

        test('does not contain only letters', () => {
            const validLetters = lettersOnly('ab1');
            const _validLetters = lettersOnly('1');
            const _validLetters1 = lettersOnly('AB-');
            const _validLetters2 = isAlphaNumeric('AB -');

            expect(validLetters).toBe(false);
            expect(_validLetters).toBe(false);
            expect(_validLetters1).toBe(false);
            expect(_validLetters2).toBe(true);
        });
    });

    describe('Object', () => {
        test('is empty', () => {
            const empty = isEmpty({});

            expect(empty).toBe(true);
        });

        test('is not empty', () => {
            const empty = isEmpty({ name: 'anon' });

            expect(empty).toBe(false);
        });
    });

    describe('array', () => {
        test('is empty', () => {
            const empty = isEmpty([]);

            expect(empty).toBe(true);
        });

        test('is not empty', () => {
            const empty = isEmpty(['name']);

            expect(empty).toBe(false);
        });
    });

    describe('date', () => {
        test('is formatted as YYYY-MM-DD', () => {
            const _validDate = validDate('2022-01-01');

            expect(_validDate).toBe(true);
        });

        test('is not formatted as YYYY-MM-DD', () => {
            const _validDate = validDate('2022/01/01');

            expect(_validDate).toBe(false);
        });
    });

    describe('number', () => {
        test('is non-negative', () => {
            const validNumber = isNonNegative(1);
            const _validNumber = isPositive(1);

            expect(validNumber).toBe(true);
            expect(_validNumber).toBe(true);
        });

        test('is less than 0', () => {
            const validNumber = isNonNegative(-0.1);
            const _validNumber = isPositive(-0.1);

            expect(validNumber).toBe(false);
            expect(_validNumber).toBe(false);
        });

        test('is  0', () => {
            const validNumber = isNonNegative(0);
            const _validNumber = isPositive(0);

            expect(validNumber).toBe(true);
            expect(_validNumber).toBe(false);
        });
    });

    describe('order type', () => {
        test('is invalid', () => {
            const valid = validOrderType('');
            const valid1 = validOrderType('kay');
            const valid2 = validOrderType(' ');

            expect(valid).toBe(false);
            expect(valid1).toBe(false);
            expect(valid2).toBe(false);
        });

        test('is valid', () => {
            const valid = validOrderType('sale');
            const valid1 = validOrderType('restock');

            expect(valid).toBe(true);
            expect(valid1).toBe(true);
        });
    });
});
