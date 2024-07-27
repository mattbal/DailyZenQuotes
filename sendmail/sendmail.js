const nodemailer = require("nodemailer");
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

async function handler() {
  try {
    const emails = await prisma.email.findMany()
    const index = await prisma.index.findFirst()
    const quote = await prisma.quote.findUnique({
      where: {
        id: index.index
      }
    })
    if (index.index === 403) { // if at last quote, reset to first
      await prisma.index.update({
        where: {
          index: index.index
        },
        data: {
          index: 1,
        }
      })
    } else {
      await prisma.index.update({
        where: {
          index: index.index
        },
        data: {
          index: index.index + 1,
        }
      })
    }
    console.log("Found quote for the day. Quote #", index.index)

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      secure: true,
      auth: {
        user: 'dailyzenquotes9@gmail.com',
        pass: process.env.GMAIL_PASSWORD
      },
    });

    emails.forEach((email) => {
      const html = `<p>${quote.quote}</p>
      <p>—${quote.author}</p>
      <a href="https://dailyzenquotes.com/unsubscribe?qs=${email.encryptedEmail}">Unsubscribe</a>
      `

      transporter.sendMail({
        to: email.email,
        subject: 'Daily Zen Quote',
        html,
      }, (err, info) => {
        if (err) {
          console.error(err)
        }
      });
    })
    console.log("Sent emails")
  } catch (error) {
    console.error(error)
  }
}

handler()