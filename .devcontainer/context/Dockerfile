ARG WORKSPACE_DIR="/home/developer/workspace"

FROM debian:latest AS foundation

ENV USERNAME=developer

# Create `developer` user
RUN adduser --shell /bin/zsh --home /home/${USERNAME} ${USERNAME}

RUN apt-get update

RUN apt-get update \
  && apt-get -y install git-all \
  && apt-get -y install sudo \
  && apt-get -y install curl \
  && apt-get -y install unzip \
  && apt-get -y install wget \
  && apt-get -y install zsh \
  && apt-get autoremove -y \
  && apt-get clean -y \
  && rm -rf /var/lib/apt/lists/*

# Add `developer` to `sudo` group
RUN usermod -aG sudo developer
RUN echo "developer ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/developer

ENV HOME=/home/${USERNAME}

RUN mkdir -p /home/developer/workspace

RUN chown -R developer:developer /home/developer

# Create docker group
RUN groupadd docker
RUN usermod -aG docker developer

# Install Deno
COPY --from=denoland/deno:bin-1.46.2 /deno /usr/local/bin/deno

# Set Denomon environment variables

ENV DENOMON_WORKSPACE_DIR "/home/developer/workspace"
ENV DENOMON_ARTIFACTS_DIR="/home/developer/workspace/.denomon/artifacts"
ENV DENOMON_KITS_FILE="/home/developer/workspace/.denomon/kits.json"
ENV DENOMON_KITS_DIR="/home/developer/workspace/.denomon/kits"

USER $USERNAME

ENV TERM xterm

# Set the default shell to bash rather than sh
ENV SHELL /bin/zsh

# run the installation script  
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true

RUN cat <<EOF > /home/developer/.zshrc
export ZSH="/home/${USERNAME}/.oh-my-zsh"
ZSH_THEME="robbyrussell"
plugins=(git)
source ${HOME}/.oh-my-zsh/oh-my-zsh.sh
EOF
