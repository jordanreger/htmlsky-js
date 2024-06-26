import Page from "./page.ts";

class Profile extends Page {
  title: string;

  constructor(title: string) {
    super();
    this.title = title;
  }

  generateHTML() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <title>${this.title}</title>
    </head>
    <body>
    <h1>Hello, World!</h1>
    <p>This is a simple HTML page generated by Node.js server-side.</p>
    </body>
    </html>
    `;
  }
}
