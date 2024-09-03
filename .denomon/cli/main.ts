import { Command } from 'cliffy'
import { develop } from './src/dev.ts'

await new Command()
  .name('Denomon CLI')
  .description('A clear and simple CLI for the Denomon monorepo setup.')
  .version('0.0.1')
  .usage('denomon <command> [options]')
  .action(() => console.log('Welcome to Denomon CLI!'))
  .command(
    'develop',
    'Execute the develop command of the dev-kit associated with the dist project.',
  )
  .alias('dev')
  .arguments('<project:string>')
  .action(async (_, args) => await develop(args))
  .parse(Deno.args)
