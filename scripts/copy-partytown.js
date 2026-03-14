const { copyLibFiles } = require('@builder.io/partytown/utils');
const path = require('path');

async function main() {
  await copyLibFiles(path.join(process.cwd(), 'public', '~partytown'));
  console.log('Partytown files copied to public/~partytown');
}

main().catch(console.error);
