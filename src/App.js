import React, { Component } from 'react';

import { query, getTranslations, getNormTranslations } from './api';

import TrnList from './TrnList';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txt0: "",
      txt1: "",
      uidDe0: localStorage.getItem("uidDe") || "",
      lvDe0: parseInt(localStorage.getItem("lvDe"), 10) || NaN,
      uidDe1: "",
      lvDe1: NaN,
      uidAl0: "",
      lvAl0: NaN,
      uidAl1: "",
      lvAl1: NaN,
      translations: [],
      translations0: [],
      translations1: [],
      translations01: [],
      highScores: {},
      lvCache: new Map(),
      confidence: 0,
    }
  }
  
  componentDidMount() {
    this.cacheLvs();
  }

  translate = event => {
    try {
      event.preventDefault();
    } catch (e) {}
    // this.getHighScores(this.state.lngDe0, this.state.lngAl);
    return getNormTranslations(this.state.txt0.trim(), this.state.lvDe0, this.state.lvAl0)
      .then(result => {
        // result.forEach(trn => {
        //   trn.norm_quality = trn.trans_quality / this.highScore(trn.langvar, trn.trans_langvar);
        // })
        this.setState({translations: result});
      })
  }

  fromMultTranslate = event => {
    try {
      event.preventDefault();
    } catch (e) {}
    this.getHighScores(this.state.lvDe0, this.state.lvAl);
    this.getHighScores(this.state.lvDe1, this.state.lvAl);
    let pt0 = getTranslations(this.state.txt0.trim(), this.state.lvDe0, this.state.lvAl0);
    let pt1 = getTranslations(this.state.txt1.trim(), this.state.lvDe1, this.state.lvAl0);
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
    // this.getHighScores([[this.state.lvDe0, this.state.lvAl0], [this.state.lvDe0, this.state.lvAl1]]);
    let pt0 = getNormTranslations(this.state.txt0.trim(), this.state.lvDe0, this.state.lvAl0, .95);
    let pt1 = getNormTranslations(this.state.txt0.trim(), this.state.lvDe0, this.state.lvAl1, .95);
    pt0.then(r0 => pt1.then(r1 => {
      // r0.forEach(trn => {
      //   trn.norm_quality = trn.trans_quality / this.highScore(trn.langvar, trn.trans_langvar);
      // })
      // r1.forEach(trn => {
      //   trn.norm_quality = trn.trans_quality / this.highScore(trn.langvar, trn.trans_langvar);
      // })
      localStorage.setItem("uidDe", this.state.uidDe0);
      localStorage.setItem("lvDe", this.state.lvDe0);
      this.setState({translations: [...r0, ...r1].sort((a, b) => b.norm_quality - a.norm_quality)});
    }))
  }

  cacheLvs = () => (
    query('/langvar', {limit: 0, exclude: [
      'grp', 
      'lang_code', 
      'mutable', 
      'name_expr',
      'name_expr_txt_degr',
      'var_code',
     ]}).then(
      r => {
        let lvCache = new Map();
        r.result.forEach(lv => {lvCache.set(lv.uid, lv)});
        this.setState({lvCache});
      })
  )

  uid2LvId = uid => {
    try {
      return(this.state.lvCache.get(uid).id);
    } catch (e) {
      return(0);
    }
  }
  // highScore = (lv1, lv2) => {
  //   let langvars = [lv1, lv2].sort((a,b) => a - b);
  //   return(this.state.highScores[langvars[0]][langvars[1]]);
  // }

  trnToggle = trnNum => {
    if (!this.state.translations[trnNum].backTranslations) {
      this.backTranslate(trnNum);
    }
  }

  backTranslate = trnNum => {
    let trn = this.state.translations[trnNum];
    getNormTranslations(trn.txt, parseInt(trn.langvar, 10), parseInt(trn.trans_langvar, 10))
      .then(result => {
        // result.forEach(trn => {
        //   trn.norm_quality = trn.trans_quality / this.highScore(trn.langvar, trn.trans_langvar);
        // });
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
              onChange={event => {
                let uid = event.target.value;
                this.setState({uidDe0: uid, lvDe0: this.uid2LvId(uid)});
              }}
              value={this.state.uidDe0}
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
              onChange={event => {
                let uid = event.target.value;
                this.setState({uidDe1: uid, lvDe1: this.uid2LvId(uid)});
              }}
              value={this.state.uidDe1}
            />
          </label>
        </div>
        <label>
          lng al0
          <input
            type="text"
            onChange={event => {
              let uid = event.target.value;
              this.setState({uidAl0: uid, lvAl0: this.uid2LvId(uid)});
            }}
            value={this.state.uidAl0}
          />
        </label>
        <label>
          lng al1
          <input
            type="text"
            onChange={event => {
              let uid = event.target.value;
              this.setState({uidAl1: uid, lvAl1: this.uid2LvId(uid)});
            }}
            value={this.state.uidAl1}
          />
        </label>
        <button onClick={this.toMultTranslate} type="submit">tra</button>
        <div>
          <input 
            type="range" max="1" min="0" step="0.01"
            onChange={event => {this.setState({confidence: event.target.value})}}
            value={this.state.confidence}
          />
        </div>
        <TrnList translations={this.state.translations} trnToggle={this.trnToggle} confidence={this.state.confidence}/>
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
