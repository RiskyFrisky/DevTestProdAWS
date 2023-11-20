# DevTestProdAWS

Pre-requisites

1. AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions
2. SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html#install-sam-cli-instructions
3. Bun: https://bun.sh/docs/installation
4. LocalStack: https://docs.localstack.cloud/getting-started/installation

Setup

```bash
bun i

cd Lambda/Layer/nodejs
bun i
```

Test

```bash
cd Lambda/__test__
bun test
```

Deploy

```bash
cd Lambda/Layer/nodejs
bun run compile

cd Cloudformation
sam build --template-file template.yaml
sam deploy --config-file samconfig.toml --capabilities CAPABILITY_NAMED_IAM --no-confirm-changeset
```
