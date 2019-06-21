import {
  compose, lifecycle, omitProps, pure, withProps,
} from 'recompact';
import connect from 'react-redux/es/connect/connect';
import { setOpenFamilyTabs } from '../redux/openFamilyTabs';

const mapStateToProps = ({
  selectedWithFab: {
    selectedId,
    actionType,
  }
}) => ({
  actionType,
  selectedId,
});

let openFamilyCheck = 0;
let currentFamilyId = undefined;
let timer = undefined;

export default compose(
  connect(mapStateToProps, { setOpenFamilyTabs }),
  withProps(({ selectedId, uniqueId, familyName }) => ({
    fabDropped: selectedId === -3,
    highlight: selectedId === uniqueId || selectedId === familyName,
    family: selectedId === familyName
  })),
  omitProps('selectedId'),
  lifecycle({
    componentDidUpdate(prevProps) {
      if (this.props.family && !this.props.fabDropped) {
        if (currentFamilyId != this.props.family) {
          openFamilyCheck = 0;
          clearTimeout(timer);
        }
        if (++openFamilyCheck == 1) {
          timer = setTimeout(() => {
            if (this.props.family) {
              this.props.setOpenFamilyTabs({ index: this.props.familyId, state: true });
            }
          }, 1000);
        }
      } else {
        openFamilyCheck = 0;
      }
      if (prevProps.highlight && !this.props.highlight && this.props.fabDropped) {
        if (this.props.actionType === 'send') {
          this.props.onPress();
        }
      }
    },
  }),
  pure,
);
