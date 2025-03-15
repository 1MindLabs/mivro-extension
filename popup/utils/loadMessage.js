export async function loadMessage() {
  const headers = {
    "Content-Type": "application/json",
    "Mivro-Email": "admin@mivro.org",
    "Mivro-Password": "admin@123",
  };
  const apiUrl = "http://127.0.0.1:5000/api/v1/chat/load-message";
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log("Data:", data);
  return data;
}
