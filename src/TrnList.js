import React, { Component } from 'react';

import './TrnList.css';

class BonBar extends Component {
  render() {
    return(
      <div className="bon-bar-background" title={this.props.bon}>
        <div className="bon-bar-foreground" style={{inlineSize: this.props.bon * 100}}/>
      </div>
    )
  }
}

export default class extends Component {
  render() {
    return (
      <ol className="trn-list">
        {this.props.translations.map((trn, i) => 
          <li key={i}>
            <details onToggle={() => this.props.trnToggle(i)}>
              <summary className="trn-row">
                <BonBar bon={trn.norm_quality}></BonBar>
                {trn.txt}
              </summary>
              <ol className="trn-list">
                {trn.backTranslations && trn.backTranslations.map((backTrn, i) =>
                  <li className="trn-row" key={i}>
                    <BonBar bon={backTrn.norm_quality}></BonBar>
                    {backTrn.txt}
                  </li>
                )}
              </ol>
            </details>
          </li>
        )}
      </ol>
    )
  }
}