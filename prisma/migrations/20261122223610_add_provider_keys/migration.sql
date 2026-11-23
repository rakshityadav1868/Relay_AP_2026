-- AlterTable
ALTER TABLE "users" ADD COLUMN     "razorpay_key_id" TEXT,
ADD COLUMN     "razorpay_key_secret" TEXT,
ADD COLUMN     "stripe_secret_key" TEXT;
