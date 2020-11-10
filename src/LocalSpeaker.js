import React from 'react'
import _ from 'lodash'

export class LocalSpeaker extends React.Component {
    constructor (props) {
        super(props)

        this.state = {
            selectedSpeakerDeviceId: '',
            speakerList: []
        }
    }

    componentDidMount () {
        const { deviceList = [], defaultSpeakerId, onSpeakerChanged } = this.props

        this.setState({
            speakerList: _.filter(deviceList, { type: 'audiooutput' }),
            selectedSpeakerDeviceId: defaultSpeakerId
        }, () => {
            if (_.isFunction(onSpeakerChanged)) {
                let firstSpeaker = _.find(deviceList, { id: defaultSpeakerId })
                onSpeakerChanged(firstSpeaker)
            }
        })
    }

    onSpeakerChanged = (event) => {
        const { onSpeakerChanged } = this.props
        const { speakerList = [] } = this.state
        let newSpeakerId = event.target.value
        this.setState({
            selectedSpeakerDeviceId: newSpeakerId
        }, () => {
            if (_.isFunction(onSpeakerChanged)) {
                onSpeakerChanged(_.find(speakerList, { id: newSpeakerId }) || { id: 'none', name: 'None' })
            }
        })
    }

    render () {
        const { selectedSpeakerDeviceId, speakerList } = this.state
        return <React.Fragment>
            <span>Speaker</span>
            <select value={selectedSpeakerDeviceId} onChange={this.onSpeakerChanged}>
                {_.map(speakerList, (s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
        </React.Fragment>

    }

}