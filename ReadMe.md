# Split the Terminal for Following
## _Client_
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Getting Started Client
- First, install NodeJS following the [link](https://nodejs.org/en/download/package-manager)

- Second, install node_modules package:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

- Third, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## _Server_

### Getting Started on Server
The server-side uses Flask API and requires following to be initialized
- Create virtual environment
    ```python -m venv venv```
- Run virtual environment
    ```venv\Scripts\Activate.ps1```
- Install Flask
    ```pip install Flask```
- Exit from virtual environment
    ```deactivate```
- Run the server
    ```python server.py```


### Note: If LF to URLF conversion warning occurs
Type the command below:
    ```unix2dos filename```