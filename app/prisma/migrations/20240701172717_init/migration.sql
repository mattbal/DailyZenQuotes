-- CreateTable
CREATE TABLE "Email" (
    "email" TEXT NOT NULL,
    "encryptedEmail" TEXT NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "quote" TEXT NOT NULL,
    "author" TEXT NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Index" (
    "index" INTEGER NOT NULL,

    CONSTRAINT "Index_pkey" PRIMARY KEY ("index")
);
