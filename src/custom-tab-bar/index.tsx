import { Component } from 'react'
import Taro from '@tarojs/taro'
import { CoverView, CoverImage } from '@tarojs/components'
import './index.scss'

export default class CustomTabBar extends Component {
  state = {
    selected: 0,
    color: '#9ca3af',
    selectedColor: '#667eea',
    list: [
      {
        pagePath: '/pages/home/index',
        text: '首页',
        icon: 'home',
        selectedIcon: 'home-fill'
      },
      {
        pagePath: '/pages/schedule-list/index',
        text: '我的日程',
        icon: 'list',
        selectedIcon: 'list-fill'
      }
    ]
  }

  componentDidMount() {
    // 根据当前页面设置选中状态
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const route = currentPage?.route
    
    if (route) {
      this.state.list.forEach((item, index) => {
        if (route.includes(item.pagePath.replace(/^\//, ''))) {
          this.setState({ selected: index })
        }
      })
    }
  }

  switchTab = (index: number, url: string) => {
    this.setState({ selected: index })
    Taro.switchTab({ url })
  }

  // 渲染 SVG 图标
  renderIcon = (type: string, isSelected: boolean) => {
    const color = isSelected ? this.state.selectedColor : this.state.color;
    
    // 使用 CoverImage 组件渲染 SVG 图标
    switch (type) {
      case 'home':
        return (
          <CoverImage 
            className='tab-bar-icon-svg'
            src={`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color.replace('#', '%23')}"><path d="M10,20 L10,14 L14,14 L14,20 L19,20 L19,12 L22,12 L12,3 L2,12 L5,12 L5,20 L10,20 Z"/></svg>`}
          />
        );
      case 'home-fill':
        return (
          <CoverImage 
            className='tab-bar-icon-svg'
            src={`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color.replace('#', '%23')}"><path d="M10,20 L10,14 L14,14 L14,20 L19,20 L19,12 L22,12 L12,3 L2,12 L5,12 L5,20 L10,20 Z"/></svg>`}
          />
        );
      case 'list':
        return (
          <CoverImage 
            className='tab-bar-icon-svg'
            src={`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color.replace('#', '%23')}"><path d="M3,5 L3,7 L21,7 L21,5 L3,5 Z M3,11 L3,13 L21,13 L21,11 L3,11 Z M3,17 L3,19 L21,19 L21,17 L3,17 Z"/></svg>`}
          />
        );
      case 'list-fill':
        return (
          <CoverImage 
            className='tab-bar-icon-svg'
            src={`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color.replace('#', '%23')}"><path d="M3,5 L3,7 L21,7 L21,5 L3,5 Z M3,11 L3,13 L21,13 L21,11 L3,11 Z M3,17 L3,19 L21,19 L21,17 L3,17 Z"/></svg>`}
          />
        );
      default:
        return null;
    }
  }

  render() {
    const { selected, color, selectedColor, list } = this.state

    return (
      <CoverView className='tab-bar'>
        {list.map((item, index) => {
          const isSelected = selected === index
          return (
            <CoverView
              key={index}
              className={`tab-bar-item ${isSelected ? 'active' : ''}`}
              onClick={() => this.switchTab(index, item.pagePath)}
            >
              <CoverView className='tab-bar-icon'>
                {this.renderIcon(isSelected ? item.selectedIcon : item.icon, isSelected)}
              </CoverView>
              <CoverView
                className='tab-bar-text'
                style={{ 
                  color: isSelected ? selectedColor : color,
                  fontWeight: isSelected ? '600' : '400'
                }}
              >
                {item.text}
              </CoverView>
            </CoverView>
          )
        })}
      </CoverView>
    )
  }
}