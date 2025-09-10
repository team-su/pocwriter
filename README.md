# POC Writer 

Exp/Poc writier is the code snippet collections for auto suggesting during poc and exp writing.


## Package build for .vsix file

```bash
pnpm install
pnpm vscode:publish
```

## new Snippet contribute is include in package.json check

```bash
pnpm run check-snippets-contribute
```

## contribute

1. create issue for new snippet with issue template "New poc contribution request"
2. fullfill the blanks in the issue template
3. wait for review and merge
4. and bot will auto create a new PR for your snippet

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.