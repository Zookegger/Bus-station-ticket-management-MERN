import { registerPaymentGateway } from "@services/paymentServices"
import { VNPayGateway } from "./vnpayGateway"
import { MoMoGateway } from "./momoGateway";
import logger from "@utils/logger";

export const initializePaymentGateways = (): void => {
    logger.info("Registering VNPay payment gateway...")
    registerPaymentGateway("vnpay", new VNPayGateway());
    logger.info("Registering Momo payment gateway...")
    registerPaymentGateway("momo", new MoMoGateway());
}