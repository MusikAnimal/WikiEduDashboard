React             = require 'react'
TextInput         = require '../common/text_input'
TextAreaInput     = require '../common/text_area_input'
TrainingModules   = require '../training_modules'
Checkbox          = require '../common/checkbox'
Select            = require '../common/select'
BlockActions      = require '../../actions/block_actions'
GradeableActions  = require '../../actions/gradeable_actions'
Reorderable       = require '../high_order/reorderable'

Block = React.createClass(
  displayName: 'Block'
  updateBlock: (value_key, value) ->
    to_pass = $.extend(true, {}, @props.block)
    to_pass[value_key] = value
    delete to_pass.deleteBlock
    BlockActions.updateBlock to_pass
  passedUpdateBlock: (_, modules) ->
    newBlock = $.extend(true, {}, @props.block)
    selectedIds = modules.map (module) -> module.value
    newBlock.training_module_ids = selectedIds
    BlockActions.updateBlock newBlock
  deleteBlock: ->
    if confirm "Are you sure you want to delete this block? This will delete the block and all of its content.
      \n\nThis cannot be undone."
      BlockActions.deleteBlock @props.block.id
  _setEditable: ->
    BlockActions.setEditable @props.block.id
  _isEditable: ->
    @props.editable_block_ids?.indexOf(@props.block.id) >= 0
  updateGradeable: (value_key, value) ->
    if value == 'true'
      GradeableActions.addGradeable @props.block
    else
      GradeableActions.deleteGradeable @props.gradeable.id
  render: ->
    is_graded = @props.gradeable != undefined && !@props.gradeable.deleted
    className = 'block'
    className += " block-kind-#{@props.block.kind}"

    if @_isEditable()
      blockActions = (
        <div className="float-container block__block-actions">
          <button onClick={@props.saveBlockChanges.bind(null, @props.block.id)} className="button dark pull-right no-clear">Save</button>
          <span role="button" onClick={@props.cancelBlockEditable.bind(null, @props.block.id)} className="span-link pull-right no-clear">Cancel</span>
        </div>
      )


    if @props.block.due_date?
      dueDateRead = (
        <TextInput
          onChange={@updateBlock}
          value={@props.block.due_date}
          value_key={'due_date'}
          editable={false}
          label='Due'
          show={@props.block.due_date?}
          onFocus={@props.toggleFocused}
          onBlur={@props.toggleFocused}
          p_tag_classname='block__read__due-date'
        />
      )

    if @_isEditable()
      unless @props.block.is_new
        deleteBlock = (<div className='delete-block-container'><button className='danger' onClick={@deleteBlock}>Delete Block</button></div>)
      className += ' editable'
      className += ' dragging' if @props.isDragging
      graded = (
        <Checkbox
          value={is_graded}
          onChange={@updateGradeable}
          value_key={'gradeable'}
          editable={@_isEditable()}
          label='Graded'
          container_class='graded'
        />
      )
    if (@props.block.kind < 3 && !@_isEditable())
      spacer = <span> &mdash; </span>

    modules = undefined
    if @props.block.training_modules || @_isEditable()
      modules = (
        <TrainingModules
          onChange={@passedUpdateBlock}
          all_modules={@props.all_training_modules}
          block_modules={@props.block.training_modules}
          editable={@_isEditable()}
          block={@props.block}
        />
      )

    content = (
      <div className="block__editor-container">
        <TextAreaInput
          onChange={@updateBlock}
          value={@props.block.content || 'Block description…'}
          value_key='content'
          editable={@_isEditable()}
          rows='4'
          onFocus={@props.toggleFocused}
          onBlur={@props.toggleFocused}
          wysiwyg=true
          className='block__block-content'
        />
        {modules}
      </div>
    )

    dueDateSpacer = if @props.block.due_date then (
      <span className="block__due-date-spacer"> - </span>
    )

    edit_button = if @props.edit_permissions then (
      <div className="block__edit-button-container">
        <button className="pull-right button ghost-button block__edit-block" onClick={@_setEditable}>Edit</button>
      </div>
    )

    <li className={className}>
      {blockActions}
      {edit_button}
      <div className='block__edit-container'>
        <h4 className={"block-title" + (if @_isEditable() then " block-title--editing" else "")}>
          <TextInput
            onChange={@updateBlock}
            value={@props.block.title}
            value_key={'title'}
            editable={@_isEditable()}
            placeholder='Block title'
            show={@props.block.title  && !@_isEditable()}
            className='title pull-left'
            spacer=''
            onFocus={@props.toggleFocused}
            onBlur={@props.toggleFocused}
          />
          <TextInput
            onChange={@updateBlock}
            value={@props.block.title}
            value_key={'title'}
            editable={@_isEditable()}
            placeholder='Block title'
            label='Title'
            className='pull-left'
            spacer=''
            show={@_isEditable()}
            onFocus={@props.toggleFocused}
            onBlur={@props.toggleFocused}
          />
        </h4>
        <div className="block__block-type">
          <Select
            onChange={@updateBlock}
            value={@props.block.kind}
            value_key={'kind'}
            editable={@_isEditable()}
            options={['In Class', 'Assignment', 'Milestone', 'Custom']}
            show={@props.block.kind < 3 || @_isEditable()}
            label='Block type'
            spacer=''
            popover_text={I18n.t('timeline.block_type')}
          />
          {dueDateSpacer}
          {dueDateRead || (if is_graded then (<span className='block__default-due-date'>{I18n.t('timeline.due_default')}</span>) else '')}
        </div>
      </div>
      <div className='block__edit-container'>
        <div className="block__block-due-date">
          <TextInput
            onChange={@updateBlock}
            value={@props.block.due_date}
            value_key='due_date'
            editable={@_isEditable()}
            type='date'
            label='Due date'
            spacer=''
            placeholder='Due date'
            isClearable=true
            show={@_isEditable() && parseInt(@props.block.kind) == 1}
            date_props={minDate: @props.week_start}
            onFocus={@props.toggleFocused}
            onBlur={@props.toggleFocused}
          />
        </div>
        {graded}
      </div>
      {content}
      {deleteBlock}
    </li>
)


module.exports = Block
# module.exports = Reorderable(Block, 'block', 'moveBlock')
