/**
 * @name DiscordGithubStatus Plugin
 * @authorId 334677994570383363
 * @authorLink https://twitter.com/SilentDefault
 * @source https://raw.githubusercontent.com/silentdefault/Discord-to-GitHub-Status/master/DiscordGithubStatus.plugin.js
 */

module.exports = class DiscordGithubStatus {
    customStatus = {};
    getName() { return "Discord-to-GitHub Status"; }
    getDescription() { return "Send Discord Status to your GitHub Status."; }
    getVersion() { return "1.0.0"; }
    getAuthor() { return "SilentDefault"; } // Your name

    setData(key, value) {
		BdApi.setData(this.getName(), key, value);
	}

	getData(key) {
		return BdApi.getData(this.getName(), key);
	}

    load() {
        this.githubPAT = this.getData("githubPAT");
    }

    start() {
        this.observer();
    }
    stop() {
        this.requestGitHub().send(JSON.stringify({ query: `mutation {changeUserStatus(input: {message: "", emoji: ""}) {clientMutationId}}` }));
    }

    observer() {
        if(this.githubPAT){
            let a = BdApi.findModuleByProps("guildPositions").customStatus;
        if (this.customStatus != a) {
            if (a != null) {
                let emoji = (typeof a.emojiName === "undefined") ? "" : `", emoji: "` + a.emojiName;
                this.requestGitHub().send(JSON.stringify({ query: `mutation {changeUserStatus(input: {message: "${a.text + emoji}"}) {clientMutationId}}` }));
            } else {
                this.requestGitHub().send(JSON.stringify({ query: `mutation {changeUserStatus(input: {message: "", emoji: ""}) {clientMutationId}}` }));
            }
        }
        this.customStatus = a;
        }
    }
    requestGitHub() {
        let req = new XMLHttpRequest();
        req.open("POST", "https://api.github.com/graphql", true);
        req.setRequestHeader("Authorization", "bearer "+this.githubPAT);
        req.onload = () => {
            if (req.status < 400) {
                return;
            }
            BdApi.showToast(`Animated Status: Can't change status on GitHub: ${Status.errorString(req.status)}`, { type: "error" });
        };
        return req;
    }
    getSettingsPanel() {
        let settings = document.createElement("div");
        settings.appendChild(GUI.newDivider());

        let label = document.createElement("h2");
        label.innerText = "GitHub Personal Acces Token:";
        settings.appendChild(label);
        settings.appendChild(GUI.newDivider());

        let GitHubPersonalAccesToken = document.createElement("input");
        GitHubPersonalAccesToken.type="password";
        GitHubPersonalAccesToken.className = "inputDefault-_djjkz input-cIJ7To";
        GitHubPersonalAccesToken.value = this.getData("githubPAT");
        GitHubPersonalAccesToken.placeholder = "here";
        settings.appendChild(GitHubPersonalAccesToken);
        settings.appendChild(GUI.newDivider());

        let save = GUI.newButton("Save");
        save.onclick = () => {
            this.setData("githubPAT",GitHubPersonalAccesToken.value);
            BdApi.showToast("Settings were saved!", { type: "success" });
            this.load();
			this.stop();
			this.start();
        };
        settings.appendChild(save);

        return settings;
    }
}
const GUI = {
    newDivider: (size = "15px") => {
        let divider = document.createElement("div");
        divider.style.minHeight = size;
        divider.style.minWidth = size;
        return divider;
    },
    newButton: (text, filled = true) => {
        let button = document.createElement("button");
        button.className = "button-38aScr colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN";
        if (filled) button.classList.add("lookFilled-1Gx00P");
        else button.classList.add("lookOutlined-3sRXeN");
        button.classList.add("colorGreen-29iAKY");
        button.innerText = text;
        return button;
    },
};