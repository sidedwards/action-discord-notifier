const axios = require('axios')

const core = require('@actions/core')
const github = require('@actions/github')

const webhook = core.getInput('webhook')

if (!/https:\/\/discord(app|)\.com\/api\/webhooks\/\d+?\/.+/i.exec(webhook)) {
  core.setFailed('The given discord webhook url is invalid. Please ensure you give a **full** url that start with "https://discordapp.com/api/webhooks"')
}

const shortTitle = (i) => `${i.substr(0, 55)}...`
const shortDes = (i) => `${i.substr(0, 250)}...`
const escapeMd = (str) => str.replace(/([\[\]\\`\(\)])/g, '\\$1')

const { payload: githubPayload } = github.context

const payload = {
  content: '',
  embeds: [
    {
      author: core.getInput('message-title') || 'Commits received',
      title: `[${escapeMd(shortTitle(githubPayload.issue.title))} · Issue #${githubPayload.issue.number}](${githubPayload.issue.url})`,
      description: `${escapeMd(shortDes(githubPayload.issue.body))}`
    }
  ]
}

axios
  // .post(webhook, payload)
  .post(webhook, payload)
  .then((res) => {
    core.setOutput('result', 'Webhook sent')
  })
  .catch((err) => {
    core.setFailed(`Post to webhook failed, ${err}`)
  })
