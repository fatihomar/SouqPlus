const target = 'https://souqplus.onrender.com/api/v1/auth/register';

fetch(target, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://plus-nine.vercel.app'
  },
  body: JSON.stringify({
    name: "Prod Test User",
    email: `prodtest_${Date.now()}@test.com`,
    password: "Password123!"
  })
}).then(async r => {
  console.log("REGISTER HTTP STATUS:", r.status);
  console.log("REGISTER SET-COOKIE:", r.headers.get('set-cookie'));
  console.log(await r.json());
});
