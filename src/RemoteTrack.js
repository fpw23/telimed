import React from 'react';
import _ from 'lodash'
import { componentGetCompareProps } from './Shared'
import './RemoteTrack.css'

export class RemoteTrack extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            selectedVideoId: '',
            selectedMicId: ''
        }
        this.videoRef = React.createRef()
        this.micRef = React.createRef()
        this.tracks = []
    }

    componentDidMount () {
        let { trackIds = [], selectedSpeakerDeviceId } = this.props
        trackIds = trackIds.map((track) => {
            return track["id"];
        });

        this.tracks = _.filter(window.telimed.remoteTracks, (rt) => { return _.indexOf(trackIds, rt.id) !== -1 })

        let videoTrack = _.find(this.tracks, { type: 'video' })
        let micTrack = _.find(this.tracks, { type: 'audio' })

        if (videoTrack || micTrack) {
            let newState = {}
            if (videoTrack) {
                this.updateTrack(videoTrack, 'set')
                newState.selectedVideoId = videoTrack.id
            }
            if (micTrack) {
                this.updateTrack(micTrack, 'set')
                newState.selectedMicId = micTrack.id
                micTrack.track.setAudioOutput(selectedSpeakerDeviceId)
            }
            this.setState(newState)
        }
    }

    componentDidUpdate (prevProps) {

        const trackIds = componentGetCompareProps('trackIds', this.props, prevProps, [])
        const currentTrackIdText = _.map(trackIds.Current, (ct) => { return ct.id }).join(',')
        const previousTrackIdText = _.map(trackIds.Previous, (pt) => { return pt.id}).join(',')

        if (currentTrackIdText !== previousTrackIdText) {
            let participantId = _.first(_.map(trackIds.Current, (tid) => tid.participantId))
            this.tracks = _.filter(window.telimed.remoteTracks, { participantId: participantId })
            let videoTrack = _.find(this.tracks, { type: 'video' })
            let micTrack = _.find(this.tracks, { type: 'audio' })
            let newState = {}
            if (videoTrack) {
                const { selectedVideoId } = this.state
                if (videoTrack.id !== selectedVideoId) {
                    let oldVideoTrack = _.find(this.tracks, { id: selectedVideoId })
                    if (oldVideoTrack) {
                        this.updateTrack(oldVideoTrack, 'clear')
                    }
                    this.updateTrack(videoTrack, 'set')
                    newState.selectedVideoId = videoTrack.id
                }
            }
            if (micTrack) {
                const { selectedMicId } = this.state
                if (micTrack.id !== selectedMicId) {
                    const { selectedSpeakerDeviceId } = this.props
                    let oldMicTrack = _.find(this.tracks, { id: selectedMicId })
                    if (oldMicTrack) {
                        this.updateTrack(oldMicTrack, 'clear')
                    }
                    this.updateTrack(micTrack, 'set')
                    micTrack.track.setAudioOutput(selectedSpeakerDeviceId)
                    newState.selectedMicId = micTrack.id
                }
            }
            this.setState(newState)
        }

        const selectedSpeakerDeviceId = componentGetCompareProps('selectedSpeakerDeviceId', this.props, prevProps, '')

        if (selectedSpeakerDeviceId.HasChanged) {
            const { selectedMicId } = this.state
            let micTrack = _.find(this.tracks, { id: selectedMicId })
            if (micTrack) {
                micTrack.track.setAudioOutput(selectedSpeakerDeviceId.Current)
            }
        }

    }

    componentWillUnmount () {
        const { selectedVideoId, selectedMicId } = this.state
        let videoTrack = _.find(this.tracks, { id: selectedVideoId })
        if (videoTrack) {
            try {
                this.updateTrack(videoTrack, 'clear')
            } catch (error) {
                console.log(error.message)
            }
        }
        let micTrack = _.find(this.tracks, { id: selectedMicId })
        if (micTrack) {
            try {
                this.updateTrack(micTrack, 'clear')
            } catch (error) {
                console.log(error.message)
            }
        }
    }

    onTrackStoppedEvent = (event) => {
        console.log(`Track Stopped`)
    }

    onTrackAudioOutputChangedEvent = (deviceId) => {
        console.log(`Track ${deviceId} audio output changed`)
    }

    updateTrack = (track, action = 'clear') => {
        if (action === 'clear') {
            if (track) {
                // eslint-disable-next-line default-case
                switch (track.type) {
                    case 'audio':
                    if (this.micRef.current) {
                        track.track.detach(this.micRef.current)
                    }
                    break
                    case 'video':
                    if (this.videoRef.current) {
                        track.track.detach(this.videoRef.current)
                    }
                    break
                }
            }
        } else if (action === 'set') {
            if (track) {
            // eslint-disable-next-line default-case
                switch (track.type) {
                    case 'audio':
                        if (this.micRef.current) {
                            track.track.attach(this.micRef.current)
                        }
                    break
                    case 'video':
                        if (this.videoRef.current) {
                            track.track.attach(this.videoRef.current)
                        }
                    break
                }
            }
        }
    }

    render () {

        return <div className='remote_track'>
            <div className='remote_track_controls'>
                <span>???</span>
            </div>
            <div className='remote_track_body'>
                <video autoPlay='1' ref={this.videoRef}/>
            </div>
            <div>
                <audio autoPlay='1' ref={this.micRef} />
            </div>
        </div>

    }
}