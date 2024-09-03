#!/bin/sh

USER=${USERNAME:-developer}

mkdir -p /home/${USER}/workspace/.denomon/bin

deno compile -A --output /home/${USER}/workspace/.denomon/bin/denomon /home/${USER}/workspace/.denomon/cli/main.ts

echo "export PATH=\$PATH:/home/${USER}/workspace/.denomon/bin" >> /home/${USER}/.zshrc