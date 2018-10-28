# aws-mfa-enforce

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

Serverless function to automate enforcement of Multi-Factor Authentication (MFA) to all AWS IAM users with access to AWS Management Console.

## How to use it ?

Enforcing MFA to IAM users was a manual task. But now all you have to do is, setup [Serverless Framework](https://serverless.com) and run the command:

```bash
git clone https://github.com/Chan9390/aws-mfa-enforce
cd aws-mfa-enforce
sls deploy
```

## How does it work ?

This serverless function creates an IAM Group called `MFA-enforced` with an inline policy which denies access to all AWS services until the IAM user activate MFA. It also has a lambda function which acts as a cron (for every 12 hours) to check for new IAM users and add it to the group.

![Lambda Architecture](.github/Architecture.png)

## Pre-Requisites

- an AWS account and access keys must be setup under the default profile within `~/.aws/credentials`
- Serverless Framework installed and setup on your machine - https://serverless.com/framework/docs/providers/aws/guide/installation/

## How to remove it (if necessary) ?

Goto https://console.aws.amazon.com/iam/home?#/groups/MFA-enforced and remove all users from the group. Then to remove the complete serverless function execute `sls remove`.

----

### References

- Tutorial: Enable Your Users to Configure Their Own Credentials and MFA Settings - https://docs.aws.amazon.com/IAM/latest/UserGuide/tutorial_users-self-manage-mfa-and-creds.html
- Enabling a Virtual Multi-Factor Authentication (MFA) Device (Console) - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa_enable_virtual.html