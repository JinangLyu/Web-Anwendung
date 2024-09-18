location.href = "/startseite.html";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <a href="/startseite.html">Redirect seems to not work</a>
`
