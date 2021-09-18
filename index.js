const axios = require('axios')

const core = require('@actions/core')
const github = require('@actions/github')

const webhook = core.getInput('webhook')

if (!/https:\/\/discord(app|)\.com\/api\/webhooks\/\d+?\/.+/i.exec(webhook)) {
  core.setFailed('The given discord webhook url is invalid. Please ensure you give a **full** url that start with "https://discordapp.com/api/webhooks"')
}

const shortTitle = (i) => (i.length > 55) ? `${i.substr(0, 55)}...` : i
const shortDes = (i) => (i.length > 250) ? `${i.substr(0, 250)}...` : i
const escapeMd = (str) => str.replace(/([\[\]\\`\(\)])/g, '\\$1')

const { payload: githubPayload } = github.context

const payload = {
  content: '',
  embeds: [
    {
      author: {
        name: core.getInput('message-title') || 'Commits received',
        icon_url: `${githubPayload.organization.avatar_url}`
      },
      title: escapeMd(`[${shortTitle(githubPayload.issue.title)} · Issue #${githubPayload.issue.number}](${githubPayload.issue.html_url})`),
      description: `${escapeMd(shortDes(githubPayload.issue.body))}`
    }
  ]
}

axios
  .post(webhook, payload)
  .then((res) => {
    core.setOutput('result', 'Webhook sent')
  })
  .catch((err) => {
    core.setFailed(`Post to webhook failed, ${err}`)
  })
