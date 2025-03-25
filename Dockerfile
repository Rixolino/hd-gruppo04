# Usa l'immagine di base che preferisci
FROM ubuntu:20.04

# Installa le dipendenze necessarie
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Imposta la directory di lavoro
WORKDIR /workspace

# Copia il contenuto del progetto nella directory di lavoro
COPY . /workspace

# Imposta l'utente non root
# ENV HOME /root  # <- Questa riga è stata rimossa per risolvere il problema

# Installa le dipendenze del progetto
RUN pip3 install -r requirements.txt

# Comando di default
CMD ["python3"]
