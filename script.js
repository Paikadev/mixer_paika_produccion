// Initialize the SDK with the access token
const initializeVoxeetSDK = () => {
    // Load the settings injected by the mixer
    const accessToken = $("#accessToken").val();
    const refreshToken = $("#refreshToken").val();
    const refreshUrl = $("#refreshUrl").val();

    // Reference: https://dolby.io/developers/interactivity-apis/client-sdk/reference-javascript/voxeetsdk#static-initializetoken
    VoxeetSDK.initializeToken(accessToken, () =>
        fetch(refreshUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            },
            body: { refresh_token: refreshToken }
        })
            .then((data) => data.json())
            .then((json) => json.access_token)
    );
};

const joinConference = () => {
    // Initialize the SDK
    initializeVoxeetSDK();

    // Load the settings injected by the mixer
    const catToken = $("#catToken").val();
    const conferenceId = $("#conferenceId").val();
    const thirdPartyId = $("#thirdPartyId").val();
    const layoutType = $("#layoutType").val();

    const mixer = {
        name: "Mixer",
        externalId: "Mixer_" + layoutType,
        thirdPartyId: thirdPartyId,
    };

    const joinOptions = {
        conferenceAccessToken: (catToken && catToken.length > 0 ? catToken : null),
        constraints: {
            video: false,
            audio: false
        },
        mixing: {
            enabled: true
        },
        userParams: {}
    };
    
    // Open a session for the mixer
    VoxeetSDK.session.open(mixer)
        .then(() => VoxeetSDK.conference.fetch(conferenceId))
        // Join the conference
        .then((conference) => VoxeetSDK.conference.join(conference, joinOptions))
        .catch((err) => console.error(err));
};

const replayConference = () => {
    // Initialize the SDK
    initializeVoxeetSDK();

    // Load the settings injected by the mixer
    const catToken = $("#catToken").val();
    const conferenceId = $("#conferenceId").val();
    const thirdPartyId = $("#thirdPartyId").val();
    const layoutType = $("#layoutType").val();

    const mixer = {
        name: "Mixer",
        externalId: "Mixer_" + layoutType,
        thirdPartyId: thirdPartyId
    };

    const replayOptions = {
        conferenceAccessToken: (catToken && catToken.length > 0 ? catToken : null),
        offset: 0
    };
    
    // Open a session for the mixer
    VoxeetSDK.session.open(mixer)
        .then(() => VoxeetSDK.conference.fetch(conferenceId))
        // Replay the conference from the beginning
        .then((conference) => VoxeetSDK.conference.replay(conference, replayOptions, { enabled: true}))
        .catch((err) => console.error(err));
};


// Add the video stream to the web page
const addVideoNode = (participant, stream) => {
    let participantNode = $("#participant-" + participant.id);

    if (!participantNode.length) {
        participantNode = $("<div />")
            .attr("id", "participant-" + participant.id)
            .addClass("container")
            .appendTo("#videos-container");

        $("<video autoplay playsInline muted />")
            .appendTo(participantNode);

       
    }

    // Attach the stream to the video element
    navigator.attachMediaStream(participantNode.find("video").get(0), stream);
};

// Remove the video stream from the web page
const removeVideoNode = (participant) => {
    $("#participant-" + participant.id).remove();
};


// Add a screen share stream to the web page
const addScreenShareNode = (stream) => {
    let screenshareNode = $("<div />")
        .attr("id", "screenshare")
        .appendTo("body");

    let container = $("<div />")
        .addClass("container")
        .appendTo(screenshareNode);

    let videoNode = $("<video autoplay playsInline muted />")
        .appendTo(container);

    // Attach the stream to the video element
    navigator.attachMediaStream(videoNode.get(0), stream);
};

// Remove the screen share stream from the web page
const removeScreenShareNode = () => {
    $("#screenshare").remove();
};


// Add a Video player to the web page
const addVideoPlayer = (videoUrl) => {
    $("<video autoplay playsinline />")
        .attr("id", "video-url-player")
        .attr("src", videoUrl)
        .appendTo("body");
};

// Move the cursor in the video
const seekVideoPlayer = (timestamp) => {
    $("#video-url-player")[0].currentTime = timestamp;
};

// Pause the video
const pauseVideoPlayer = () => {
    $("#video-url-player")[0].pause();
};

// Play the video
const playVideoPlayer = () => {
    $("#video-url-player")[0].play();
};

// Remove the Video player from the web page
const removeVideoPlayer = () => {
    $("#video-url-player").remove();
};


/*
 * Let the mixer know when the conference has ended.
 */
const onConferenceEnded = () => {
    $("#conferenceStartedVoxeet").remove();
    $("body").append('<div id="conferenceEndedVoxeet"></div>');
};

VoxeetSDK.conference.on("left", onConferenceEnded);
VoxeetSDK.conference.on("ended", onConferenceEnded);

$(document).ready(() => {
    $("#joinConference").click(joinConference);
    $("#replayConference").click(replayConference);
    
    const layoutType = $("layoutType").val();
    if (layoutType === "stream" || layoutType === "hls") {
        // Display the live message for the live streams
        $("#live").removeClass("hide");
    }

    // Inform the mixer that the application is ready to start
    $("<div />").attr("id", "conferenceStartedVoxeet").appendTo("body");


    // Initialize the SDK
    // Please read the documentation at:
    // https://docs.dolby.io/communications-apis/docs/initializing-javascript
    // Insert your client access token (from the Dolby.io dashboard) and conference id
    const clientAccessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkb2xieS5pbyIsImlhdCI6MTY4NzYzMDA3NSwic3ViIjoicjRqTnZ4Yy16RkNySHlTdmh0dzNWQT09IiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9DVVNUT01FUiJdLCJ0YXJnZXQiOiJzZXNzaW9uIiwib2lkIjoiM2MyYmM3Y2MtYjZlNy00ZWU0LWFiYmItNDlhMzhhMDRkOGIzIiwiYWlkIjoiODI5YjMzMTYtMjliZS00ODhmLWIxOTktMDdmNmQ0NWJjMzg0IiwiYmlkIjoiOGEzNjljM2M4N2VjMTcyNjAxODdlZmY3NzgxNDQ2OTUiLCJleHAiOjE2ODc3MTY0NzV9.CiMVQaSjTiHHNOxCIO2HAb763o8Au_zr5XDZpc2CjbTvYghxrkOTycxzj8i2vCJFVlaen4mSqHUW3YhE4BzvrQ";
    const conferenceId = "e7da7ed2-17fb-4dae-afaf-2e90491cfff1";

    VoxeetSDK.initializeToken(clientAccessToken, (isExpired) => {
        return new Promise((resolve, reject) => {
            if (isExpired) {
                reject('The client access token has expired.');
            } else {
                resolve(clientAccessToken);
            }
        });
    });

    const mixer = { name: "Test", externalId: "Test" };
    const joinOptions = { constraints: { video: false, audio: false } };
    
    // Open a session for the mixer
    VoxeetSDK.session.open(mixer)
        .then(() => VoxeetSDK.conference.fetch(conferenceId))
        // Join the conference
        .then((conference) => VoxeetSDK.conference.join(conference, joinOptions))
        .catch((err) => console.error(err));
});