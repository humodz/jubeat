import { InputHTMLAttributes } from 'react';
import { Icon } from '../Icon';
import styles from './styles.module.css';

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={styles.searchInput}>
      <Icon icon="magnifying-glass" />
      <input type="text" {...props} />
    </label>
  );
}
