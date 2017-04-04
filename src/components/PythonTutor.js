import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'

import ExecutionVisualizer from './PythonTutor/ExecutionVisualizer'
import Ladder from './PythonTutor/Ladder'

class PythonTutor extends Component {
  constructor(props) {
    super(props)
    window.pythonTutor = this
  }

  componentDidMount() {
  }

  init() {
    console.log('hello world')

    const data = {
      code: this.props.beforeCode,
      trace: this.props.beforeTraces
    }
    const options = {
      embeddedMode: true,
      lang: 'py2',
      startingInstruction: 10,
      editCodeBaseURL: 'visualize.html'
    }
    const demoViz = new ExecutionVisualizer('demoViz', data, options);

    $('.variableTr[data-name="previous"]').addClass('highlight-var-name')

    window.ladder.init()

  }

  render() {
    return (
      <div className="ui two column centered grid">
        PythonTutor
        <div id="demoViz" className="ten wide column"></div>
        <div className="five wide column">
          <Ladder
            beforeHistory={ this.props.beforeHistory }
            afterHistory={ this.props.afterHistory }

            beforeEvents={ this.props.beforeEvents }
            afterEvents={ this.props.afterEvents }

            beforeAst={ this.props.beforeAst }
            afterAst={ this.props.afterAst }

            currentCode={ this.props.currentCode }
            beforeCode={ this.props.beforeCode }

            before={ this.props.before }

            focusKeys={ this.props.focusKeys }
            test={ this.props.test }
            expected={ this.props.expected }
            result={ this.props.result }
            root={ this }
          />
        </div>
      </div>
    )
  }
}

export default PythonTutor
