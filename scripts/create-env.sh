    #!/bin/bash
    # Create a .env file from an example template

    set -e

    ENV_FILE="./.env"
    EXAMPLE_ENV_FILE="env.example"

    if [ ! -f "$EXAMPLE_ENV_FILE" ]; then
      echo "$EXAMPLE_ENV_FILE not found!"
      exit 1
    fi

    cp "$EXAMPLE_ENV_FILE" "$ENV_FILE"

    echo ".env file created. Please fill in your credentials."