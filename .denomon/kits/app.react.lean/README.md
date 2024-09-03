# Denomon "React Lean" kit

A [Denomon](https://github.com/duesabati/denomon) kit for developing client side
rendered React apps!

## What is Denomon?

Denomon is essentially a repository template that gives a clean and clear
structure of your code, it's also capable of self-updating and allows a Deno
development ecosystem to grow on top of it.

It has its own CLI and practices but it does not hide anything from you, altough
it tries to be as subtle as possible everything is under the sun and you can
control any part of it.

Read more about it [here](https://github.com/duesabati/denomon).

## Features

- Uses [`esbuild`](https://esbuild.github.io/) for transpiling and bundling,
  using an improved
  [`deno-plugin`](https://github.com/twosaturdayscode/esbuild-deno-plugin).
- Uses TailwindCSS for styling.
- Reload on changes.

## How to install?

You can simply clone it in the denomon kits folder or the denomon CLI using the
`kits` command:

> [!TIP]
> You can specify the folder name in which the code of the kit will reside in
> the denomon kits folder

> [!IMPORTANT]
> If you choose to just clone the repository, please remember to add the folder
> to the `workspace` array in the root `deno.json` config file, unfortunately
> Deno `workspace` feature does not support globs.

```sh
denomon kits add https://github.com/duesabati/denomon-kit-react-lean [dirname:string]
```

## Usage

Once you've added the kit, you need to tell denomon to use it for your app
development, this is done by adding an entry to the denomon kits file, usually
found at `.denomon/kits.json`

```jsonc
// .denomon/kits.json
{
  "associations": {
    "web": "@denomon/kit-react-lean"
  }
}
```

The kit expects the followings:

- Have a `main.ts` file as entrypoint of your app.
- An `index.css` file and `tailwind.config.js`.
- A folder called `static` containing all the assets that will be served
  publicly

```
# Project structure
dist
  web <-- name of our project
    src
    static <-- static assets folder
    main.tsx <-- entrypoint
    index.css <-- main css file
    tailwind.config.js <-- tailwind config
```

Done! You are ready to go, just use the denomon commands to:

develop

```sh
denomon dev web
```

and build

```sh
denomon build web
```
