import React, { Component } from 'react'
import Highlight from 'react-highlight'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Tree from '../Data/Tree'

let i = 0

class Quiz extends Component {
  constructor(props) {
    super(props)
    this.state = {
      quizes: [],
      ast: {},
      code: '',
      origin: '',
      startLine: 0
    }
    window.quiz = this
  }

  componentDidMount() {
    let code = 'previous = term(base)' // this.props.before.split('\n')[this.props.line-1].trim()
    $.ajax({
      url: 'https://python-ast-explorer.com/api/_parse',
      method: 'POST',
      data: code,
    })
    .then((res) => {
      console.log('get response')
      window.res = res

      let tree = new Tree()
      tree.history = window.app.props.beforeHistory // TODO
      tree.tick = 0
      tree.analyze(res)
      this.setState({ quizes: tree.quizes, ast: tree.ast })
    })

    this.setState({
      code: 'previous = term(base)',
      origin: 'previous = term(base)',
      startLine: 2
    })
  }

  showWidget() {
    if (!this.refs.editor) return false
    this.cm = this.refs.editor.getCodeMirror()
    this.cm.addLineClass(2-1, '', 'current-line')
    let msg = document.createElement('div')
    msg.append($('.inline-hint')[0])
    this.cm.addLineWidget(1, msg, { coverGutter: true })
  }


  onChange(quiz, index, event) {
    let value = event.target.value
    if (value === undefined) return
    if (value == quiz.value) {
      $(`#q-${index} .inline-input`).addClass('correct')
      $(`#q-${index} .inline-message`).addClass('correct')
      this.addValue()
    } else {
      $(`#q-${index} .inline-input`).removeClass('correct')
      $(`#q-${index} .inline-message`).removeClass('correct')
    }
  }

  addValue() {

    let update = 'term(11)'
    if (i === 1) {
      update = 'square(11)'
    }
    if (i === 2) {
      update = 'square(11) returns 121'
    }
    if (i === 3) {
      update = '121'
    }
    let code = `${this.state.origin}  # ${update}`
    this.setState({ code: code })
    i++
  }


  render() {
    const options = {
      mode: 'python',
      theme: 'base16-light',
      lineNumbers: true,
      firstLineNumber: this.state.startLine
    }

    return (
      <div className="quiz">

        <CodeMirror
          value={ this.state.code }
          ref="editor"
          options={ options }
        />

        <div className="inline-hint">
          <div className="arrow-up"></div>
          <div className="arrow-border"></div>
          <div className="dynamic-hint">
            { this.state.quizes.map((quiz, index) => {
              return (
                <div id={ `q-${index}` } key={ index }>
                  <p>Q. What is the value of <code>{ quiz.key }</code>?</p>
                  <p>
                    <code>{ quiz.key }</code> =
                    <input className={ 'inline-input'  } type="text" placeholder={ quiz.value } onChange={ this.onChange.bind(this, quiz, index) } />
                    <span className="inline-message">Correct!</span>
                  </p>
                  { quiz.calls ? quiz.calls.map((call) => {
                    return (
                      <p>{ call }</p>
                    )
                  }) : '' }
                </div>
              )
            }) }

          </div>
        </div>

      </div>
    )
  }

}

export default Quiz