import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'
import Highlight from 'react-highlight'
import Quiz from './InteractiveHint/Quiz'
import Ladder from './InteractiveHint/Ladder'
import Answer from './InteractiveHint/Answer'
import Play from './InteractiveHint/Play'

class InteractiveHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 0,
      loops: [],
      text: '',
      events: [],
      quizIndex: null,
      currentLine: null,
    }
    window.interactiveHint = this
  }

  componentDidMount() {
    this.init()
  }

  init() {
    this.translate()

    if (!this.refs.editor) return false
    this.cm = this.refs.editor.getCodeMirror()

    window.cm = this.cm

    let msg = document.createElement('div')
    // msg = React.createElement('div', { className: 'hoge' },
    //   'fjwaofjaeow'
    // )
    this.cm.addLineWidget(3, msg, { coverGutter: true })


  }

  translate(compare = false) {
    let events = this.props.beforeEvents
    // .filter(event => this.props.focusKeys.includes(event.key))
    let filteredEvents = []
    let text = ''
    for (let event of events) {
      switch (event.type) {
        case 'call':
          if (event.children.length === 0) continue
          for (let child of event.children) {
            text += `${event.key} calls ${child}`
          }
          break
        case 'return':
          if (event.builtin) continue
          text += `${event.key} returns ${event.value}`
          break
        default:
          if (!this.props.focusKeys.includes(event.key)) continue
          if (event.index === 0) {
            text += `${event.key} is initialized with ${event.value}`
          } else {
            text += `${event.key} is updated to ${event.value}`
          }
          break
      }
      text += ` at line ${ event.line }`
      text += '\n'
      if (event.type !== 'call') filteredEvents.push(event)
    }
    this.setState({ text: text, events: filteredEvents })
  }

  onClick(index, line, event) {
    $(event.target).removeClass('primary')
    setTimeout(() => {
      let target = $(`#hoge .CodeMirror`)
      target.popup('toggle')

      this.setState({ quizIndex: index, currentLine: line })
      let top = 75 + parseInt(line)*24
      $('.inline-hint').css('top',`${top}px`)
      window.cm.addLineClass(line-1, '', 'current-line')
    }, 100)
  }

  onClose() {
    let popup = $('.popup')
    if (popup.hasClass('visible')) {
      popup.removeClass('visible')
      popup.addClass('hidden')
    }
    window.cm.removeLineClass(this.state.currentLine-1, '', 'current-line')
    this.setState({ quizIndex: null, currentLine: null })
  }

  clickWhy() {
    $('#step-2-1').show()
    $('#button-2-1').removeClass('primary')
  }

  render() {

    $('#hoge .CodeMirror').popup({
      target: $('#hoge .CodeMirror'),
      position: 'bottom center',
      inline: true,
      popup : $(`.inline-hint`),
      on: 'manual',
      onHide: () => {
      },
    })

    return (
      <div>
        <h1>Interactive Hint</h1>

        <div className="ui message hint-message">
          <div className="ui two column grid">
            <div className="eight wide column">
              <h2>Code</h2>
              <div id="hoge">
              <CodeMirror
                value={ this.props.currentCode }
                ref="editor"
                options={ this.props.options }
              />
              </div>
              <br />
              <h2>Failed Test Result</h2>
              <Highlight className="python">
                { this.props.log }
              </Highlight>
            </div>
            <div className="eight wide column">
              <h2>Behavior</h2>
              <Ladder
                beforeHistory={ this.props.beforeHistory }
                afterHistory={ this.props.afterHistory }
                beforeEvents={ this.props.beforeEvents }
                afterEvents={ this.props.afterEvents }
                beforeAst={ this.props.beforeAst }
                afterAst={ this.props.afterAst }
                focusKeys={ this.props.focusKeys }
                test={ this.props.test }
                expected={ this.props.expected }
                result={ this.props.result }
                root={ this }
              />

              { this.state.events.map((event, index) => {
                return (
                  <p key={ index }>
                    <button className="ui basic primary button" onClick={ this.onClick.bind(this, index, event.line) }>Why ?</button>
                  </p>
                )
              }) }

              <div className="ui fluid popup bottom center transition inline-hint">
                { this.state.events.map((event, index) => {
                  let question = ''
                  question += 'Q. Why '
                  question += event.key
                  if (event.type === 'return') {
                    question += ' returns '
                  }
                  if (event.type === 'assign') {
                    if (event.index === 0) {
                      question += ' is initialized with '
                    } else {
                      question += ' is updated to '
                    }
                  }
                  question += event.value
                  question += ' ?'
                  let events = this.props.beforeEvents.slice(0, event.id)
                  let history = {}
                  for (let e of events) {
                    history[e.key] = e
                  }

                  return (
                    <div id={ `quiz-${index} `} className="quiz" key={ index } style={{ display: this.state.quizIndex === index ? 'block' : 'none' }}>
                      <h1><b>{ question }</b></h1>
                      <Quiz
                        id={ `quiz-${ index }` }
                        options={ this.props.options }
                        line={ event.line }
                        currentCode={ this.props.currentCode }
                        beforeCode={ this.props.beforeCode }
                        before={ this.props.before }
                        beforeAst={ this.props.beforeAst }
                        history={ history }
                      />
                    </div>
                  )
                }) }
                <button className="ui basic button close-button" onClick={ this.onClose.bind(this) } style={{ float: 'right' }}>Close</button>
              </div>

              {/*
              <Play
                traces={ this.props.traces }
                step={ this.props.step }
                beforeCode={ this.props.beforeCode }
                currentCode={ this.props.currentCode }
              />
              */}



            </div>
          </div>
        </div>
        <Answer
          options={ this.props.options }
          id={ this.props.id }
          code={ this.props.code }
          before={ this.props.before }
          after={ this.props.after }

          added={ this.props.added }
          removed={ this.props.removed }

          beforeHistory={ this.props.beforeHistory }
          afterHistory={ this.props.afterHistory }
        />

          <div className="arrow-up"></div>
          <div className="arrow-border"></div>
          <pre className="dynamic-hint"></pre>

      </div>
    )
  }
}

export default InteractiveHint
