// export const sendTelegramCode = async (telegramUserId, phoneNumber, code = "889797") => {
//   const BOT_TOKEN = "7727359959:AAHm4z9KNLlPpVu6HyloOwQ5A222QuwyaxA";
//   const chatId = telegramUserId;   

//   const text = ` رقم التحقق لرقم الهاتف: ${phoneNumber}\n  رمز التحقق هو: ${code}`;

//   try {
//     const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         chat_id: chatId,
//         text: text,
//       }),
//     });

//     const data = await response.json();
//     if (!data.ok) throw new Error(data.description);
//     return true;
//   } catch (error) {
//     //     return false;
//   }
// };

