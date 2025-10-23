# OMRChecker Frontend

This is the Next.js frontend for the OMRChecker web application.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **File Upload**: React Dropzone
- **Icons**: Lucide React

## Project Structure

- `src/app/` - Next.js app directory (pages and layouts)
- `src/components/` - React components
- `src/lib/` - Utility functions and API client

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Main Project README](../WEB_APP_README.md)
