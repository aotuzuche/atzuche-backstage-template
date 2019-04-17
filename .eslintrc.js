module.exports = {
  extends: ['eslint-config-alloy/react'],
  rules: {
    semi: ['error', 'never'],
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
        VariableDeclarator: 1,
        outerIIFEBody: 1,
        FunctionDeclaration: {
          parameters: 1,
          body: 1
        },
        FunctionExpression: {
          parameters: 1,
          body: 1
        },
        CallExpression: {
          arguments: 1
        },
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        flatTernaryExpressions: false,
        ignoredNodes: [
          'JSXElement',
          'JSXElement > *',
          'JSXAttribute',
          'JSXIdentifier',
          'JSXNamespacedName',
          'JSXMemberExpression',
          'JSXSpreadAttribute',
          'JSXExpressionContainer',
          'JSXOpeningElement',
          'JSXClosingElement',
          'JSXText',
          'JSXEmptyExpression',
          'JSXSpreadChild'
        ],
        ignoreComments: false
      }
    ],
    'no-param-reassign': 0,
    'no-extend-native': 0,
    'no-script-url': 0,
    'no-proto': 'error',
    'react/jsx-indent': ['error', 2],
    'react/jsx-indent-props': ['error', 2],
    'prefer-promise-reject-errors': 0
  }
}
