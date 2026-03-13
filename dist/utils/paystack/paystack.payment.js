"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackService = void 0;
class PaystackService {
    constructor() {
        this.paystackSecretKey = process.env.PAYSTACK_KEY;
    }
    initTransaction(email, amount, userId, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentDate = new Date();
                const milliseconds = currentDate.getMilliseconds();
                const response = yield fetch('https://api.paystack.co/transaction/initialize', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.paystackSecretKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: amount * 100, // Amount in kobo (e.g., 10000 kobo = ₦100)
                        email: email,
                        reference: milliseconds,
                        metadata: {
                            userId,
                            amount,
                        },
                        callback_url: callback,
                    }),
                });
                const data = yield response.json();
                if (!data.status) {
                    return {
                        status: false,
                        message: 'Unable to initialize transactions',
                    };
                }
                return {
                    status: true,
                    message: 'Payment successfully initialize',
                    data: {
                        url: data.data.authorization_url,
                        reference: data.data.reference,
                    },
                };
            }
            catch (error) {
                console.error('Error in initializing transaction:', error);
                return {
                    status: false,
                    message: 'Unable to initialize transactions',
                    error: error,
                };
            }
        });
    }
    verifyTransaction(reference) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${this.paystackSecretKey}`,
                    },
                });
                const data = yield response.json();
                if (!data.status) {
                    return {
                        status: false,
                        message: 'Transaction reference not found',
                    };
                }
                if (data.data.gateway_response != 'Successful') {
                    return {
                        status: false,
                        message: 'Transaction was not completed',
                    };
                }
                return {
                    status: true,
                    message: 'Transaction verified successfully',
                    data: data.data.metadata,
                };
            }
            catch (error) {
                console.error('Error in initializing transaction:', error);
                return {
                    status: false,
                    message: 'Unable to verify transactions',
                    error: error,
                };
            }
        });
    }
}
exports.PaystackService = PaystackService;
