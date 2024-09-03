import { which } from 'which'

export const denoPath = async () => await which('deno')
