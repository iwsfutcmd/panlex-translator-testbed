const VERSION = 2
const APISERVER = 'https://api.panlex.org'
const URLBASE = (VERSION === 2) ? APISERVER + '/v2' : APISERVER

function query(ep, params) {
  let url = URLBASE + ep
  return(fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(params),
  })
  .then((response) => response.json()));
}

function getTranslations(txt, uidDe, uidAl, distance = 0) {
  let queryOne = {
    include: ['trans_quality', 'trans_txt', 'trans_langvar'],
    sort: 'trans_quality desc',
  };
  // if (typeof txt === 'number' || txt.every(v => typeof v === 'number')) {
  if (Array.prototype.every.call(txt, v => typeof v === 'number')) {
    queryOne.trans_expr = txt
  } else {
    queryOne.trans_txt = txt
    if (typeof uidDe === 'number') {
      queryOne.trans_langvar = uidDe
    } else {
      queryOne.trans_uid = uidDe
    }
  }
  if (typeof uidAl === 'number') {
    queryOne.langvar = uidAl
  } else {
    queryOne.uid = uidAl
  }
  let queryTwo = Object.assign({trans_distance: 2}, queryOne);
  switch (distance) {
    case 1:
      return(query('/expr', queryOne).then(responseData => responseData.result))
    case 2:
      return(query('/expr', queryTwo).then(responseData => responseData.result))
    default:
      return(query('/fallback', {requests: [
        {url: '/expr', query: queryOne},
        {url: '/expr', query: queryTwo},
      ]}).then(responseData => responseData.result))
  }
}

function getTransPath(exprDe, exprAl) {
  let queryParams = {
    trans_expr: exprDe,
    id: exprAl,
    include: 'trans_path',
    trans_distance: 2,
  };
  return(query('/expr', queryParams).then(responseData => responseData.result[0]))
}

function getMultTranslations(txtArray, uidDe, uidAl) {
  return(
    getTranslations(txtArray, uidDe, uidAl).then(
      (result) => {
        let output = {};
        let txtNotFound = [];
        for (let txt of txtArray) {
          let trnList = result.filter(trn => (trn.trans_txt === txt || trn.trans_expr === txt));
          if (trnList.length) {
            output[txt] = trnList;
          } else {
            txtNotFound.push(txt);
          }
        }
        return([output, txtNotFound])
      }
    ).then(
      ([output, txtNotFound]) => {
        if (txtNotFound.length) {
          return(
            getTranslations(txtNotFound, uidDe, uidAl).then(
              (result) => {
                for (let txt of txtNotFound) {
                  output[txt] = result.filter(trn => (trn.trans_txt === txt || trn.trans_expr === txt));
                }
                return(output);
              }
            )
          )
        } else {
          return(output)
        }
      }
    )
  )
}

function getAllTranslations(uidDe, uidAl, byId = false) {
  return(
    query("/expr", typeof uidDe === 'number' ? {langvar: uidDe} : {uid: uidDe}).then(
      r => {
        let exprList = r.result.map(expr => byId ? expr.id : expr.txt);
        return(
          getMultTranslations(exprList, uidDe, uidAl)
        )
      }
    )
  )
}
export { query, getTranslations, getTransPath, getMultTranslations, getAllTranslations }