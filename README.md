# DevTestProdAWS

#### Main Branch

[![unit-test](https://github.com/RiskyFrisky/DevTestProdAWS/actions/workflows/unit-test.yml/badge.svg?branch=main)](https://github.com/RiskyFrisky/DevTestProdAWS/actions/workflows/unit-test.yml)
[![integration-test](https://github.com/RiskyFrisky/DevTestProdAWS/actions/workflows/integration-test.yml/badge.svg?branch=main)](https://github.com/RiskyFrisky/DevTestProdAWS/actions/workflows/integration-test.yml)
[![deploy](https://github.com/RiskyFrisky/DevTestProdAWS/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/RiskyFrisky/DevTestProdAWS/actions/workflows/deploy.yml)

#### Dev Branch

[![unit-test](https://github.com/RiskyFrisky/DevTestProdAWS/actions/workflows/unit-test.yml/badge.svg?branch=dev)](https://github.com/RiskyFrisky/DevTestProdAWS/actions/workflows/unit-test.yml)
[![integration-test](https://github.com/RiskyFrisky/DevTestProdAWS/actions/workflows/integration-test.yml/badge.svg?branch=dev)](https://github.com/RiskyFrisky/DevTestProdAWS/actions/workflows/integration-test.yml)

This project was used as a learning tool to figure out how to develop a production-grade CI / CD workflow that would minimize the risk of publishing bad code into production AWS environments.

Access application frontend: https://riskyfrisky.github.io/DevTestProdAWS

# Steps for running on your PC

Pre-requisites

1. Bun: https://bun.sh/docs/installation
2. Tools for deploying on LocalStack
    - Docker: https://www.docker.com/products/docker-desktop
    - AWS CLI: https://docs.localstack.cloud/user-guide/integrations/aws-cli/#localstack-aws-cli-awslocal
    - SAM CLI: https://docs.localstack.cloud/user-guide/integrations/aws-sam/#installation
3. Tools for deploying on AWS
    - AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions
    - SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html#install-sam-cli-instructions

Setup

```bash
bun i

cd $(git rev-parse --show-toplevel)/Lambda/Layer/nodejs
bun i
```

Unit Test

```bash
cd $(git rev-parse --show-toplevel)/Lambda/__test__/unit
bun test
```

Build

```bash
cd $(git rev-parse --show-toplevel)/Lambda/Layer/nodejs
bun run compile

cd $(git rev-parse --show-toplevel)/Cloudformation
samlocal build --template-file template.yaml
or
sam build --template-file template.yaml
```

Deploy on LocalStack (Requires PRO account for LambdaLayer use)

-   Get auth token from https://app.localstack.cloud/workspace/auth-token & set in `.env` file

```bash
cd $(git rev-parse --show-toplevel)/Lambda/__test__/integration/localstack
docker compose --env-file $(git rev-parse --show-toplevel)/.env up

awslocal s3 mb s3://devtestprodaws

cd $(git rev-parse --show-toplevel)/Cloudformation
samlocal deploy --config-file samconfig.toml --capabilities CAPABILITY_NAMED_IAM --no-confirm-changeset
```

-   Integration test

    ```bash
    export FUNCTION_URL=$(awslocal lambda list-function-url-configs --function-name devtestprodaws-main | grep -o '"FunctionUrl": "[^"]*' | awk -F'"' '{print $4}')

    cd $(git rev-parse --show-toplevel)/Lambda/__test__/integration
    bun test
    ```

Deploy on AWS

-   Create a unique bucket name in AWS cloud first (e.g. devtestprodaws-2) & update samconfig.toml `s3_bucket` value

```bash
cd $(git rev-parse --show-toplevel)/Cloudformation
sam deploy --config-file samconfig.toml --capabilities CAPABILITY_NAMED_IAM --no-confirm-changeset
```

# Test GitHub actions locally

Test action locally with `act`

-   https://github.com/nektos/act

```bash
gh act --secret-file .env --job unit-test-job
gh act --secret-file .env --job integration-test-job
gh act --job deploy-job
```
