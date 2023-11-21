# DevTestProdAWS

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

-   Get auth token: https://app.localstack.cloud/workspace/auth-token & set in .env

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

# GitHub Action:

Test action locally with `act`

-   https://github.com/nektos/act

```bash
act --secret-file .env -v
```
