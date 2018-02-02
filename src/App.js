import React, { Component } from 'react';

import { query, getTranslations, getMultTranslations, getTransPath, getAllTranslations } from './api';

import TrnList from './TrnList';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txt0: "",
      txt1: "",
      lngDe0: "",
      lngDe1: "",
      lngAl0: "",
      lngAl1: "",
      translations: [],
      translations0: [],
      translations1: [],
      translations01: [],
      highScores: {},
    }
  }
  
  translate = event => {
    try {
      event.preventDefault();
    } catch (e) {}
    this.getHighScores(this.state.lngDe0, this.state.lngAl);
    return getTranslations(this.state.txt0.trim(), this.state.lngDe0, this.state.lngAl0)
      .then(result => {
        result.forEach(trn => {
          trn.norm_quality = trn.trans_quality / this.highScore(trn.langvar, trn.trans_langvar);
        })
        this.setState({translations: result});
      })
  }

  fromMultTranslate = event => {
    try {
      event.preventDefault();
    } catch (e) {}
    this.getHighScores(this.state.lngDe0, this.state.lngAl);
    this.getHighScores(this.state.lngDe1, this.state.lngAl);
    let pt0 = getTranslations(this.state.txt0.trim(), this.state.lngDe0, this.state.lngAl0);
    let pt1 = getTranslations(this.state.txt1.trim(), this.state.lngDe1, this.state.lngAl0);
    pt0.then(r0 => pt1.then(r1 => {
      let translations0 = [], translations1 = [], translations01 = [];
      r0.forEach(trn => {
        trn.norm_quality = trn.trans_quality / this.highScore(trn.langvar, trn.trans_langvar);
        if (new Set(r1.map(trn => trn.id)).has(trn.id)) {
          translations01.push({txt: trn.txt});
        } else {
          translations0.push({txt: trn.txt});
        }})
      r1.forEach(trn => {
        trn.norm_quality = trn.trans_quality / this.highScore(trn.langvar, trn.trans_langvar);
        if (!new Set(r0.map(trn => trn.id)).has(trn.id)) {
          translations1.push({txt: trn.txt});
        }})
      this.setState({translations0: r0, translations1: r1, translations01});
    }))
  }

  toMultTranslate = event => {
    try {event.preventDefault()} catch (e) {}
    this.getHighScores(this.state.lngDe0, this.state.lngAl0);
    this.getHighScores(this.state.lngDe0, this.state.lngAl1);
    let pt0 = getTranslations(this.state.txt0.trim(), this.state.lngDe0, this.state.lngAl0, 1);
    let pt1 = getTranslations(this.state.txt0.trim(), this.state.lngDe0, this.state.lngAl1, 1);
    pt0.then(r0 => pt1.then(r1 => {
      r0.forEach(trn => {
        trn.norm_quality = trn.trans_quality / this.highScore(trn.langvar, trn.trans_langvar);
      })
      r1.forEach(trn => {
        trn.norm_quality = trn.trans_quality / this.highScore(trn.langvar, trn.trans_langvar);
      })
      this.setState({translations: [...r0, ...r1].sort((a, b) => b.norm_quality - a.norm_quality)});
    }))
  }

  getHighScores = (lv1, lv2) => {
    let highScores = this.state.highScores;
    query(["/langvar_pair", lv1, lv2].join("/"), {}).then(r => {
      let langvars = [r.langvar_pair.langvar1, r.langvar_pair.langvar2].sort((a,b) => a - b);
      if (!highScores[langvars[0]]) {highScores[langvars[0]] = {}};
      highScores[langvars[0]][langvars[1]] = r.langvar_pair.max_quality_d1;
      this.setState({highScores});
    })
  }

  highScore = (lv1, lv2) => {
    let langvars = [lv1, lv2].sort((a,b) => a - b);
    return(this.state.highScores[langvars[0]][langvars[1]]);
  }

  trnToggle = trnNum => {
    if (!this.state.translations[trnNum].backTranslations) {
      this.backTranslate(trnNum);
    }
  }

  backTranslate = trnNum => {
    let trn = this.state.translations[trnNum];
    getTranslations(trn.txt, trn.langvar, trn.trans_langvar)
      .then(result => {
        result.forEach(trn => {
          trn.norm_quality = trn.trans_quality / this.highScore(trn.langvar, trn.trans_langvar);
        });
        let translations = this.state.translations;
        translations[trnNum].backTranslations = result;
        this.setState({translations})
      })
  }

  render() {
    return (
      <div className="App">
        <div>
          <label>
            txt0
            <input
              type="text"
              onChange={event => {this.setState({txt0: event.target.value})}}
              value={this.state.txt0}
            />
          </label>
          <label>
            lng de0
            <input
              type="text"
              onChange={event => {this.setState({lngDe0: event.target.value})}}
              value={this.state.lngDe0}
            />
          </label>
        </div>
        <div>
          <label>
            txt1
            <input
              type="text"
              onChange={event => {this.setState({txt1: event.target.value})}}
              value={this.state.txt1}
            />
          </label>
          <label>
            lng de1
            <input
              type="text"
              onChange={event => {this.setState({lngDe1: event.target.value})}}
              value={this.state.lngDe1}
            />
          </label>
        </div>
        <label>
          lng al0
          <input
            type="text"
            onChange={event => {this.setState({lngAl0: event.target.value})}}
            value={this.state.lngAl0}
          />
        </label>
        <label>
          lng al1
          <input
            type="text"
            onChange={event => {this.setState({lngAl1: event.target.value})}}
            value={this.state.lngAl1}
          />
        </label>
        <button onClick={this.toMultTranslate} type="submit">tra</button>
        <TrnList translations={this.state.translations} trnToggle={this.trnToggle}/>
        <div className="trn-columns">
          <TrnList translations={this.state.translations0}/>
          {/* <TrnList translations={this.state.translations01}/> */}
          <TrnList translations={this.state.translations1}/>
        </div>
      </div>
    );
  }
}

export default App;
