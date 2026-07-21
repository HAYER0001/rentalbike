const OWNER_EMAIL = "bhagatsingh21216247@gmail.com";
const formRes = await fetch(`https://formsubmit.co/ajax/${OWNER_EMAIL}`, {
  method: "POST",
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Referer": "https://rental.hayertechnologies.tech/"
  },
  body: JSON.stringify({ message: "Test with Referer" }),
});
console.log(formRes.status, await formRes.text());
